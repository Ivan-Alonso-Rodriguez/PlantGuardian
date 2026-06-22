from dataclasses import dataclass
from enum import StrEnum

from backend.app.schemas.sensor_reading import IrrigationMode, SensorReadingCreate


class SystemStatus(StrEnum):
    EXCELENTE = "EXCELENTE"
    ESTABLE = "ESTABLE"
    ATENCION = "ATENCION"
    CRITICO = "CRITICO"


@dataclass(frozen=True)
class HealthAlert:
    type: str
    severity: str
    message: str


@dataclass(frozen=True)
class HealthAssessment:
    status: SystemStatus
    score: int
    alerts: list[HealthAlert]
    recommendations: list[str]


class PlantHealthService:
    SOIL_MIN = 35
    LIGHT_LOW = 45
    LIGHT_HIGH = 75
    TEMP_HIGH = 32.0
    AMBIENT_HUMIDITY_LOW = 35.0

    def evaluate(self, reading: SensorReadingCreate) -> HealthAssessment:
        score = 100
        alerts: list[HealthAlert] = []
        recommendations: list[str] = []

        if not reading.dht_ok:
            score -= 8
            alerts.append(
                HealthAlert(
                    type="sensor_dht11",
                    severity="warning",
                    message="No se pudo leer correctamente el DHT11.",
                )
            )
            recommendations.append("Revisar cableado o alimentacion del sensor DHT11.")

        if reading.tanque_bajo:
            score -= 45
            alerts.append(
                HealthAlert(
                    type="water_tank",
                    severity="critical",
                    message="El tanque tiene bajo nivel de agua.",
                )
            )
            recommendations.append("Rellenar el tanque antes de activar riego.")

        both_dry = reading.planta1_seca and reading.planta2_seca
        if both_dry:
            score -= 35
            alerts.append(
                HealthAlert(
                    type="soil_moisture",
                    severity="critical",
                    message="Ambas plantas necesitan riego.",
                )
            )
            recommendations.append("Revisar ambas plantas y priorizar riego.")
        else:
            if reading.planta1_seca or reading.hum_p1 < self.SOIL_MIN:
                score -= 18
                alerts.append(
                    HealthAlert(
                        type="soil_moisture_p1",
                        severity="warning",
                        message="La planta 1 necesita riego.",
                    )
                )
                recommendations.append("La planta 1 necesita riego.")

            if reading.planta2_seca or reading.hum_p2 < self.SOIL_MIN:
                score -= 18
                alerts.append(
                    HealthAlert(
                        type="soil_moisture_p2",
                        severity="warning",
                        message="La planta 2 necesita riego.",
                    )
                )
                recommendations.append("La planta 2 necesita riego.")

        if reading.luz < self.LIGHT_LOW:
            score -= 10
            alerts.append(
                HealthAlert(
                    type="light_low",
                    severity="warning",
                    message="La luz ambiental es baja.",
                )
            )
            recommendations.append("Mover la planta a una zona con mas luz.")
        elif reading.luz > self.LIGHT_HIGH:
            score -= 6
            alerts.append(
                HealthAlert(
                    type="light_high",
                    severity="info",
                    message="La planta tiene mucha exposicion a la luz.",
                )
            )
            recommendations.append("Vigilar posible exceso de luz directa.")

        if reading.temp_dht11 > self.TEMP_HIGH:
            score -= 12
            alerts.append(
                HealthAlert(
                    type="temperature_high",
                    severity="warning",
                    message="La temperatura ambiental es alta.",
                )
            )
            recommendations.append("Revisar ventilacion y exposicion solar.")

        if reading.hum_dht11 < self.AMBIENT_HUMIDITY_LOW:
            score -= 8
            alerts.append(
                HealthAlert(
                    type="ambient_humidity_low",
                    severity="warning",
                    message="La humedad ambiental es baja.",
                )
            )
            recommendations.append("Mantener vigilancia sobre la humedad ambiental.")

        if reading.modo == IrrigationMode.AUTO:
            recommendations.append("El modo automatico esta activo.")

        if not alerts:
            recommendations.append("El sistema se encuentra estable.")

        score = max(score, 0)
        status = self._resolve_status(reading, alerts, score)

        return HealthAssessment(
            status=status,
            score=score,
            alerts=alerts,
            recommendations=recommendations,
        )

    def _resolve_status(
        self,
        reading: SensorReadingCreate,
        alerts: list[HealthAlert],
        score: int,
    ) -> SystemStatus:
        if reading.tanque_bajo or (reading.planta1_seca and reading.planta2_seca):
            return SystemStatus.CRITICO

        if any(alert.severity == "warning" for alert in alerts):
            return SystemStatus.ATENCION

        if score >= 95 and reading.modo == IrrigationMode.AUTO:
            return SystemStatus.EXCELENTE

        return SystemStatus.ESTABLE
