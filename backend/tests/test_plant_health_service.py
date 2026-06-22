import unittest

from backend.app.schemas.sensor_reading import SensorReadingCreate
from backend.app.services.plant_health_service import (
    PlantHealthService,
    SystemStatus,
)


def make_reading(**overrides):
    payload = {
        "humP1": 60,
        "humP2": 65,
        "tempDHT11": 24.0,
        "humDHT11": 55.0,
        "luz": 60,
        "estadoLuz": "LUZ_MEDIA",
        "agua": 80,
        "planta1Seca": 0,
        "planta2Seca": 0,
        "tanqueBajo": 0,
        "bombaP1": 0,
        "bombaP2": 0,
        "regando": 0,
        "plantaRegando": 0,
        "dhtOk": 1,
        "modo": "AUTO",
    }
    payload.update(overrides)
    return SensorReadingCreate.model_validate(payload)


class PlantHealthServiceTest(unittest.TestCase):
    def setUp(self) -> None:
        self.service = PlantHealthService()

    def test_stable_reading_in_auto_mode_is_excellent(self) -> None:
        assessment = self.service.evaluate(make_reading())

        self.assertEqual(assessment.status, SystemStatus.EXCELENTE)
        self.assertEqual(assessment.score, 100)
        self.assertEqual(assessment.alerts, [])
        self.assertIn("El modo automatico esta activo.", assessment.recommendations)

    def test_low_tank_is_critical(self) -> None:
        assessment = self.service.evaluate(
            make_reading(tanqueBajo=1, agua=10)
        )

        self.assertEqual(assessment.status, SystemStatus.CRITICO)
        self.assertTrue(
            any(alert.type == "water_tank" for alert in assessment.alerts)
        )
        self.assertIn("Rellenar el tanque antes de activar riego.", assessment.recommendations)

    def test_dry_soil_generates_attention(self) -> None:
        assessment = self.service.evaluate(
            make_reading(humP1=20, planta1Seca=1)
        )

        self.assertEqual(assessment.status, SystemStatus.ATENCION)
        self.assertTrue(
            any(alert.type == "soil_moisture_p1" for alert in assessment.alerts)
        )

    def test_both_plants_dry_is_critical(self) -> None:
        assessment = self.service.evaluate(
            make_reading(humP1=20, humP2=18, planta1Seca=1, planta2Seca=1)
        )

        self.assertEqual(assessment.status, SystemStatus.CRITICO)
        self.assertTrue(
            any(alert.type == "soil_moisture" for alert in assessment.alerts)
        )

    def test_low_light_generates_recommendation(self) -> None:
        assessment = self.service.evaluate(
            make_reading(luz=20, estadoLuz="OSCURO")
        )

        self.assertEqual(assessment.status, SystemStatus.ATENCION)
        self.assertIn("Mover la planta a una zona con mas luz.", assessment.recommendations)


if __name__ == "__main__":
    unittest.main()
