import { useMemo, useState } from "react";
import { CircleStop, Droplet, Power, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { ControlButton } from "../components/ControlButton";
import { Screen } from "../components/Screen";
import { createApiClient } from "../services/apiClient";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";

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
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState("Sin comandos enviados");
  const styles = makeStyles(theme);

  async function send(path: string) {
    setBusyPath(path);
    try {
      const response = await api.sendCommand(path);
      setLastCommand(`${response.command} publicado`);
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
