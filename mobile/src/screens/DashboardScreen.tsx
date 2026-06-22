import { useCallback, useEffect, useMemo, useState } from "react";
import { Droplets, Gauge, Sun, Thermometer, Waves } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AlertCard } from "../components/AlertCard";
import { DashboardHeader } from "../components/DashboardHeader";
import { PlantStatusCard } from "../components/PlantStatusCard";
import { Screen } from "../components/Screen";
import { SensorCard } from "../components/SensorCard";
import { createApiClient } from "../services/apiClient";
import { connectRealtime } from "../services/realtimeClient";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";
import { DashboardResponse } from "../types/api";
import { celsius, percent } from "../utils/format";

const emptyDashboard: DashboardResponse = {
  status: "SIN_DATOS",
  score: 0,
  latest_reading: null,
  alerts: [],
  recommendations: ["Esperando lecturas del sistema."]
};

export function DashboardScreen() {
  const theme = useTheme();
  const apiBaseUrl = useSettingsStore((state) => state.apiBaseUrl);
  const api = useMemo(() => createApiClient(apiBaseUrl), [apiBaseUrl]);
  const [dashboard, setDashboard] = useState<DashboardResponse>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const styles = makeStyles(theme);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setDashboard(await api.getDashboard());
    } catch {
      setDashboard(emptyDashboard);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return connectRealtime(
      apiBaseUrl,
      () => refresh(),
      setConnected
    );
  }, [apiBaseUrl, refresh]);

  const reading = dashboard.latest_reading;

  return (
    <Screen>
      <DashboardHeader status={dashboard.status} connected={connected} onRefresh={refresh} />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.emerald} />
        </View>
      ) : null}

      <View style={styles.scoreBand}>
        <View>
          <Text style={styles.scoreLabel}>Salud del sistema</Text>
          <Text style={styles.score}>{dashboard.score}</Text>
        </View>
        <Text style={styles.mode}>{reading?.modo ?? "SIN_DATOS"}</Text>
      </View>

      {reading ? (
        <>
          <View style={styles.plants}>
            <PlantStatusCard
              name="Planta 1"
              humidity={reading.hum_p1}
              dry={reading.planta1_seca}
              watering={reading.bomba_p1}
            />
            <PlantStatusCard
              name="Planta 2"
              humidity={reading.hum_p2}
              dry={reading.planta2_seca}
              watering={reading.bomba_p2}
            />
          </View>

          <View style={styles.grid}>
            <SensorCard icon={Thermometer} label="Temperatura" value={celsius(reading.temp_dht11)} detail="DHT11" tone="info" />
            <SensorCard icon={Waves} label="Humedad aire" value={percent(reading.hum_dht11)} detail="DHT11" tone="ok" />
            <SensorCard icon={Droplets} label="Tanque" value={percent(reading.agua)} detail={reading.tanque_bajo ? "Bajo" : "Disponible"} tone={reading.tanque_bajo ? "danger" : "ok"} />
            <SensorCard icon={Sun} label="Luz" value={percent(reading.luz)} detail={reading.estado_luz} tone={reading.luz < 45 ? "warn" : "info"} />
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Gauge color={theme.colors.textMuted} size={34} />
          <Text style={styles.emptyText}>Sin lecturas disponibles</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas</Text>
        {dashboard.alerts.length > 0 ? (
          dashboard.alerts.map((alert) => <AlertCard key={`${alert.type}-${alert.message}`} alert={alert} />)
        ) : (
          <Text style={styles.muted}>Sin alertas activas.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendaciones</Text>
        {dashboard.recommendations.map((item) => (
          <Text key={item} style={styles.recommendation}>{item}</Text>
        ))}
      </View>
    </Screen>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    loading: {
      alignItems: "center",
      paddingVertical: 8
    },
    scoreBand: {
      alignItems: "center",
      backgroundColor: theme.colors.forest,
      borderRadius: theme.radius.md,
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 96,
      padding: 18
    },
    scoreLabel: {
      color: "#B7E4CB",
      fontSize: 13,
      fontWeight: "800"
    },
    score: {
      color: "#FFFFFF",
      fontSize: 42,
      fontWeight: "900",
      marginTop: 2
    },
    mode: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900"
    },
    plants: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between"
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between"
    },
    empty: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      minHeight: 150,
      justifyContent: "center"
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontWeight: "800",
      marginTop: 8
    },
    section: {
      gap: 10
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900"
    },
    muted: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "700"
    },
    recommendation: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 20,
      padding: 14
    }
  });
}
