import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Droplets, Sun, Thermometer, Waves } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { ChartCard } from "../components/ChartCard";
import { IrrigationStatusCard } from "../components/IrrigationStatusCard";
import { Screen } from "../components/Screen";
import { SensorCard } from "../components/SensorCard";
import { createApiClient } from "../services/apiClient";
import { connectRealtime } from "../services/realtimeClient";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";
import { SensorReading } from "../types/api";
import { celsius, percent } from "../utils/format";

export function SensorDetailsScreen() {
  const theme = useTheme();
  const apiBaseUrl = useSettingsStore((state) => state.apiBaseUrl);
  const api = useMemo(() => createApiClient(apiBaseUrl), [apiBaseUrl]);
  const isFocused = useIsFocused();
  const [history, setHistory] = useState<SensorReading[]>([]);
  const latest = history[0];
  const styles = makeStyles(theme);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getHistory(30);
      setHistory(data.items);
    } catch {
      // Keep the last readings visible during transient network hiccups.
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    return connectRealtime(apiBaseUrl, () => refresh());
  }, [apiBaseUrl, isFocused, refresh]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Sensores</Text>
        <Text style={styles.subtitle}>{history.length} lecturas recientes</Text>
      </View>

      {latest ? (
        <>
          <IrrigationStatusCard reading={latest} />

          <View style={styles.grid}>
            <SensorCard icon={Droplets} label="Suelo P1" value={percent(latest.hum_p1)} detail={latest.planta1_seca ? "Seca" : "Normal"} tone={latest.planta1_seca ? "danger" : "ok"} />
            <SensorCard icon={Droplets} label="Suelo P2" value={percent(latest.hum_p2)} detail={latest.planta2_seca ? "Seca" : "Normal"} tone={latest.planta2_seca ? "danger" : "ok"} />
            <SensorCard icon={Thermometer} label="Temp" value={celsius(latest.temp_dht11)} detail="Ambiente" tone="info" />
            <SensorCard icon={Waves} label="Humedad" value={percent(latest.hum_dht11)} detail="Ambiente" tone="ok" />
            <SensorCard icon={Sun} label="Luz" value={percent(latest.luz)} detail={latest.estado_luz} tone="info" />
            <SensorCard icon={Droplets} label="Tanque" value={percent(latest.agua)} detail={latest.tanque_bajo ? "Bajo" : "OK"} tone={latest.tanque_bajo ? "danger" : "ok"} />
          </View>
        </>
      ) : (
        <Text style={styles.empty}>Sin datos para mostrar.</Text>
      )}

      <ChartCard title="Humedad planta 1" values={history.map((item) => item.hum_p1).reverse()} color={theme.colors.emerald} />
      <ChartCard title="Humedad planta 2" values={history.map((item) => item.hum_p2).reverse()} color={theme.colors.blue} />
      <ChartCard title="Nivel de agua" values={history.map((item) => item.agua).reverse()} color={theme.colors.petrol} />
    </Screen>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    header: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      padding: 16
    },
    title: {
      color: theme.colors.text,
      fontSize: 26,
      fontWeight: "900"
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 8
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between"
    },
    empty: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "700"
    }
  });
}
