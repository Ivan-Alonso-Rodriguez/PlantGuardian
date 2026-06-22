from enum import StrEnum


class MqttTopic(StrEnum):
    DATA = "iot/riego/datos"
    STATUS = "iot/riego/estado"
    COMMANDS = "iot/riego/comandos"


class IrrigationCommand(StrEnum):
    AUTO_ON = "AUTO_ON"
    AUTO_OFF = "AUTO_OFF"
    WATER_P1 = "WATER_P1"
    WATER_P2 = "WATER_P2"
    STOP = "STOP"


VALID_COMMANDS = {command.value for command in IrrigationCommand}
