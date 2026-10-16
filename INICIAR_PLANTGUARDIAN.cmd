@echo off
title PlantGuardian
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-PlantGuardian.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo iniciar PlantGuardian.
)
echo.
pause
