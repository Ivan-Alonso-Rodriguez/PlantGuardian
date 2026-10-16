param()

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$runtimeDir = Join-Path $root ".plantguardian"
$statePath = Join-Path $runtimeDir "runtime.json"
$temp = [System.IO.Path]::GetTempPath()

function Get-LanIpAddress {
    $connections = Get-NetIPConfiguration |
        Where-Object {
            $_.NetAdapter.Status -eq "Up" -and
            $_.IPv4DefaultGateway -and
            $_.IPv4Address
        } |
        Sort-Object @{
            Expression = {
                if ($_.InterfaceAlias -match "Wi-Fi|Wireless|WLAN") { 0 } else { 1 }
            }
        }

    $address = $connections |
        ForEach-Object { $_.IPv4Address.IPAddress } |
        Where-Object { $_ -and $_ -notlike "169.254.*" } |
        Select-Object -First 1

    if (-not $address) {
        throw "No se encontro una conexion de red IPv4 activa."
    }

    return $address
}

function Get-ListenerProcessId([int]$Port) {
    return Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -First 1
}

function Wait-ForPort([int]$Port, [int]$Seconds = 25) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        $processId = Get-ListenerProcessId $Port
        if ($processId) {
            return $processId
        }
        Start-Sleep -Milliseconds 500
    }

    throw "El puerto $Port no se abrio despues de $Seconds segundos."
}

function Resolve-Executable([string[]]$Candidates) {
    foreach ($candidate in $Candidates) {
        if (-not $candidate) {
            continue
        }

        if (Test-Path $candidate) {
            return (Resolve-Path $candidate).Path
        }

        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }
    }

    return $null
}

function Test-PlantGuardianExpoProcess([int]$ProcessId) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
    return $process -and
        $process.CommandLine -like "*PlantGuardian*mobile*" -and
        $process.CommandLine -like "*expo*start*"
}

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$lanIp = Get-LanIpAddress
$previousState = $null

if (Test-Path $statePath) {
    try {
        $previousState = Get-Content $statePath -Raw | ConvertFrom-Json
    } catch {
        $previousState = $null
    }
}

Write-Host ""
Write-Host "PlantGuardian" -ForegroundColor Green
Write-Host "Red detectada: $lanIp"

# MQTT
$mqttPid = Get-ListenerProcessId 1883
if (-not $mqttPid) {
    $mosquittoService = Get-Service -Name "mosquitto" -ErrorAction SilentlyContinue
    if ($mosquittoService) {
        try {
            Start-Service -Name "mosquitto"
        } catch {
            # Fall back to a user process when service control needs elevation.
        }
    }

    Start-Sleep -Seconds 1
    $mqttPid = Get-ListenerProcessId 1883

    if (-not $mqttPid) {
        $mosquitto = "C:\Program Files\Mosquitto\mosquitto.exe"
        $mosquittoConfig = "C:\Program Files\Mosquitto\mosquitto.conf"
        if (-not (Test-Path $mosquitto)) {
            throw "Mosquitto no esta instalado en $mosquitto."
        }

        Start-Process -FilePath $mosquitto `
            -ArgumentList @("-c", $mosquittoConfig) `
            -WorkingDirectory (Split-Path $mosquitto) `
            -WindowStyle Hidden
        $mqttPid = Wait-ForPort 1883
    }
}
Write-Host "MQTT      listo (PID $mqttPid)" -ForegroundColor Green

# Backend
$backendPid = Get-ListenerProcessId 8000
if (-not $backendPid) {
    $python = Resolve-Executable @(
        $(if ($env:VIRTUAL_ENV) { Join-Path $env:VIRTUAL_ENV "Scripts\python.exe" }),
        (Join-Path $root ".venv\Scripts\python.exe"),
        "python.exe"
    )
    if (-not $python) {
        throw "No se encontro Python para iniciar el backend."
    }

    try {
        & $python -c "import uvicorn, fastapi, paho.mqtt.client, sqlalchemy" | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "No se pudieron importar las dependencias del backend."
        }
    } catch {
        throw "Faltan dependencias del backend. Ejecuta: python -m venv .venv; .\.venv\Scripts\python -m pip install -r backend\requirements.txt"
    }

    $env:PYTHONPATH = $root
    $env:PYTHONDONTWRITEBYTECODE = "1"
    $env:PLANTGUARDIAN_USE_DATABASE = "true"
    $env:DATABASE_URL = "sqlite:///./plantguardian.db"
    $env:PLANTGUARDIAN_MQTT_ENABLED = "true"
    $env:PLANTGUARDIAN_MQTT_INGEST_ENABLED = "true"
    $env:MQTT_HOST = "127.0.0.1"
    $env:MQTT_PORT = "1883"
    $env:MQTT_CLIENT_ID = "plantguardian-backend"

    Start-Process -FilePath $python `
        -ArgumentList @("-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000") `
        -WorkingDirectory $root `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $temp "plantguardian-backend.out.log") `
        -RedirectStandardError (Join-Path $temp "plantguardian-backend.err.log")
    $backendPid = Wait-ForPort 8000
}
Write-Host "Backend   listo (PID $backendPid)" -ForegroundColor Green

# Expo
$expoPid = Get-ListenerProcessId 8081
$ipChanged = $previousState -and $previousState.lanIp -and $previousState.lanIp -ne $lanIp

if ($expoPid -and $ipChanged -and (Test-PlantGuardianExpoProcess $expoPid)) {
    Write-Host "La IP cambio; reiniciando Expo para anunciar $lanIp..."
    Stop-Process -Id $expoPid -Force
    Start-Sleep -Seconds 1
    $expoPid = $null
}

$node = Resolve-Executable @(
    "node.exe"
)
if (-not $node) {
    throw "No se encontro Node.js para iniciar Expo."
}

if (-not $expoPid) {
    $expo = Join-Path $root "mobile\node_modules\.bin\expo.CMD"
    if (-not (Test-Path $expo)) {
        throw "Faltan dependencias de Expo. Ejecuta la instalacion en mobile primero."
    }

    $env:BROWSER = "none"
    $env:EXPO_NO_TELEMETRY = "1"
    $env:EXPO_OFFLINE = "1"
    $env:EXPO_PUBLIC_API_BASE_URL = "http://${lanIp}:8000"
    $env:REACT_NATIVE_PACKAGER_HOSTNAME = $lanIp
    Remove-Item Env:CI -ErrorAction SilentlyContinue
    $env:PATH = "$(Split-Path $node);$env:PATH"

    Start-Process -FilePath $expo `
        -ArgumentList @("start", "--go", "--offline", "--port", "8081") `
        -WorkingDirectory (Join-Path $root "mobile") `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $temp "plantguardian-expo.out.log") `
        -RedirectStandardError (Join-Path $temp "plantguardian-expo.err.log")
    $expoPid = Wait-ForPort 8081 40
}
Write-Host "Expo      listo (PID $expoPid)" -ForegroundColor Green

$health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -TimeoutSec 5
$metroStatus = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:8081/status" -TimeoutSec 5
if ($health.status -ne "ok" -or [Text.Encoding]::UTF8.GetString($metroStatus.Content) -ne "packager-status:running") {
    throw "Los servicios arrancaron, pero la comprobacion de salud fallo."
}

@{
    lanIp = $lanIp
    mqttPid = $mqttPid
    backendPid = $backendPid
    expoPid = $expoPid
    startedAt = (Get-Date).ToString("o")
} | ConvertTo-Json | Set-Content -Path $statePath -Encoding UTF8

$expoUrl = "exp://${lanIp}:8081"
$bundleUrl = "http://127.0.0.1:8081/index.bundle?platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&unstable_transformProfile=hermes-stable"
$prewarmCommand = "try { Invoke-WebRequest -UseBasicParsing -Uri '$bundleUrl' -TimeoutSec 240 | Out-Null } catch {}"
Start-Process -FilePath "powershell.exe" `
    -ArgumentList @("-NoProfile", "-Command", $prewarmCommand) `
    -WindowStyle Hidden

Write-Host ""
Write-Host "Expo Go: $expoUrl" -ForegroundColor Cyan
Write-Host "Backend: http://${lanIp}:8000"
Write-Host "MQTT:    ${lanIp}:1883"
Write-Host ""

$qrModule = Join-Path $root "mobile\node_modules\.pnpm\qrcode-terminal@0.11.0\node_modules\qrcode-terminal"
if (Test-Path $qrModule) {
    $normalizedQrModule = $qrModule.Replace("\", "/")
    & $node -e "require('$normalizedQrModule').generate('$expoUrl', { small: true })"
}

Write-Host "Todo listo. Conecta el telefono a la misma red y abre Expo Go." -ForegroundColor Green
