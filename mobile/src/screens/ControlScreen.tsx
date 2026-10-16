import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CircleStop, Droplet, Power, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { ControlButton } from "../components/ControlButton";
import { IrrigationStatusCard } from "../components/IrrigationStatusCard";
import { Screen } from "../components/Screen";
import { createApiClient } from "../services/apiClient";
import { connectRealtime } from "../services/realtimeClient";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";
import { SensorReading } from "../types/api";

const commands = [
  { label: "Activar automatico", path: "/api/control/auto-on", icon: ShieldCheck, variant: "primary" as const },
  { label: "Modo manual", path: "/api/control/auto-off", icon: Power, variant: "neutral" as const },
  { label: "Regar planta 1", path: "/api/control/water-p1", icon: Droplet, variant: "primary" as const },
  { label: "Regar planta 2", path: "/api/control/water-p2", icon: Droplet, variant: "primary" as const },
  { label: "Detener riego", path: "/api/control/stop", icon: CircleStop, variant: "danger" as const }
];

export function ControlScreen() {
  const theme = useTheme();
  const apiBaseUrl = useSettingsStore((state) => state.apiBaseUrl);
  const api = useMemo(() => createApiClient(apiBaseUrl), [apiBaseUrl]);
  const isFocused = useIsFocused();
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState("Sin comandos enviados");
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const styles = makeStyles(theme);

  const refresh = useCallback(async () => {
    try {
      const dashboard = await api.getDashboard();
      setLatestReading(dashboard.latest_reading);
    } catch {
      setLatestReading(null);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    return connectRealtime(apiBaseUrl, () => refresh());
  }, [apiBaseUrl, isFocused, refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function send(path: string) {
    setBusyPath(path);
    try {
      const response = await api.sendCommand(path);
      setLastCommand(`${response.command} publicado`);
      await refresh();
    } catch {
      setLastCommand("No se pudo publicar el comando");
    } finally {
      setBusyPath(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Control remoto</Text>
        <Text style={styles.subtitle}>{lastCommand}</Text>
      </View>

      <IrrigationStatusCard reading={latestReading} />

      <View style={styles.actions}>
        {commands.map((command) => (
          <ControlButton
            key={command.path}
            icon={command.icon}
            label={command.label}
            variant={command.variant}
            disabled={busyPath !== null}
            onPress={() => send(command.path)}
          />
        ))}
      </View>
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
    actions: {
      gap: 12
    }
  });
}
