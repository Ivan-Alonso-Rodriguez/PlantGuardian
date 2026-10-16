import { SensorReading } from "../types/api";

export type IrrigationState = {
  active: boolean;
  plantLabel: string;
  shortLabel: string;
  detail: string;
};

export function getIrrigationState(reading?: SensorReading | null): IrrigationState {
  const active = Boolean(
    reading?.regando ||
    reading?.bomba_p1 ||
    reading?.bomba_p2 ||
    reading?.planta_regando === 1 ||
    reading?.planta_regando === 2
  );

  if (!reading || !active) {
    return {
      active: false,
      plantLabel: "Sin riego activo",
      shortLabel: "Sin riego",
      detail: "Bombas detenidas"
    };
  }

  if (reading.planta_regando === 1 || reading.bomba_p1) {
    return {
      active: true,
      plantLabel: "Regando planta 1",
      shortLabel: "Riego P1",
      detail: "Bomba P1 activa"
    };
  }

  if (reading.planta_regando === 2 || reading.bomba_p2) {
    return {
      active: true,
      plantLabel: "Regando planta 2",
      shortLabel: "Riego P2",
      detail: "Bomba P2 activa"
    };
  }

  return {
    active: true,
    plantLabel: "Riego activo",
    shortLabel: "Riego activo",
    detail: "Bomba activa"
  };
}
