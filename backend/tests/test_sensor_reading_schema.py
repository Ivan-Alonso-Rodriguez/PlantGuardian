import unittest

from pydantic import ValidationError

from backend.app.schemas.sensor_reading import (
    IrrigationMode,
    LightState,
    SensorReadingCreate,
)


VALID_PAYLOAD = {
    "humP1": 54,
    "humP2": 63,
    "tempDHT11": 24.6,
    "humDHT11": 58.1,
    "luz": 67,
    "estadoLuz": "LUZ_MEDIA",
    "agua": 82,
    "planta1Seca": 0,
    "planta2Seca": 0,
    "tanqueBajo": 0,
    "bombaP1": 0,
    "bombaP2": 1,
    "regando": 1,
    "plantaRegando": 2,
    "dhtOk": 1,
    "modo": "AUTO",
}


class SensorReadingCreateTest(unittest.TestCase):
    def test_accepts_device_payload_and_normalizes_fields(self) -> None:
        reading = SensorReadingCreate.model_validate(VALID_PAYLOAD)

        self.assertEqual(reading.hum_p1, 54)
        self.assertEqual(reading.estado_luz, LightState.LUZ_MEDIA)
        self.assertEqual(reading.modo, IrrigationMode.AUTO)
        self.assertTrue(reading.regando)
        self.assertEqual(reading.planta_regando, 2)
        self.assertEqual(reading.active_pump, 2)

    def test_accepts_snake_case_payload(self) -> None:
        payload = {
            "hum_p1": 54,
            "hum_p2": 63,
            "temp_dht11": 24.6,
            "hum_dht11": 58.1,
            "luz": 67,
            "estado_luz": "luz_media",
            "agua": 82,
            "planta1_seca": False,
            "planta2_seca": False,
            "tanque_bajo": False,
            "bomba_p1": False,
            "bomba_p2": False,
            "regando": False,
            "modo": "manual",
        }

        reading = SensorReadingCreate.model_validate(payload)

        self.assertEqual(reading.estado_luz, LightState.LUZ_MEDIA)
        self.assertEqual(reading.modo, IrrigationMode.MANUAL)
        self.assertFalse(reading.regando)

    def test_rejects_out_of_range_percentages(self) -> None:
        payload = {**VALID_PAYLOAD, "humP1": 150}

        with self.assertRaises(ValidationError):
            SensorReadingCreate.model_validate(payload)

    def test_rejects_invalid_boolean_values(self) -> None:
        payload = {**VALID_PAYLOAD, "tanqueBajo": 2}

        with self.assertRaises(ValidationError):
            SensorReadingCreate.model_validate(payload)


if __name__ == "__main__":
    unittest.main()
