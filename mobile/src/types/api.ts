export type SystemStatus = "EXCELENTE" | "ESTABLE" | "ATENCION" | "CRITICO" | "SIN_DATOS";
export type LightState = "OSCURO" | "LUZ_MEDIA" | "MUCHA_LUZ";
export type IrrigationMode = "AUTO" | "MANUAL";

export type SensorReading = {
  id?: number;
  hum_p1: number;
  hum_p2: number;
  temp_dht11: number;
  hum_dht11: number;
  luz: number;
  estado_luz: LightState;
  agua: number;
  planta1_seca: boolean;
  planta2_seca: boolean;
  tanque_bajo: boolean;
  bomba_p1: boolean;
  bomba_p2: boolean;
  regando: boolean;
  planta_regando: number;
  dht_ok: boolean;
  modo: IrrigationMode;
  created_at?: string;
};

export type HealthAlert = {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type DashboardResponse = {
  status: SystemStatus;
  score: number;
  latest_reading: SensorReading | null;
  alerts: HealthAlert[];
  recommendations: string[];
};

export type HistoryResponse = {
  items: SensorReading[];
  count: number;
};

export type CommandResponse = {
  command: string;
  topic: string;
  created_at?: string;
  published: boolean;
};
