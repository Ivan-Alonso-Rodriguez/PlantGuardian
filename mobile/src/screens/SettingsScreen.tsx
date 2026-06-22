import { Moon, Server, Sun } from "lucide-react-native";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { Screen } from "../components/Screen";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";

export function SettingsScreen() {
  const theme = useTheme();
  const apiBaseUrl = useSettingsStore((state) => state.apiBaseUrl);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setApiBaseUrl = useSettingsStore((state) => state.setApiBaseUrl);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const styles = makeStyles(theme);
  const ModeIcon = themeMode === "dark" ? Moon : Sun;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Servidor y apariencia</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.rowTitle}>
          <Server color={theme.colors.emerald} size={22} />
          <Text style={styles.label}>Backend API</Text>
        </View>
        <TextInput
          autoCapitalize="none"
          placeholder="http://127.0.0.1:8000"
          placeholderTextColor={theme.colors.textMuted}
          value={apiBaseUrl}
          onChangeText={setApiBaseUrl}
          style={styles.input}
        />
      </View>

      <View style={styles.panelRow}>
        <View style={styles.rowTitle}>
          <ModeIcon color={theme.colors.amber} size={22} />
          <View>
            <Text style={styles.label}>Tema</Text>
            <Text style={styles.value}>{themeMode}</Text>
          </View>
        </View>
        <Switch value={themeMode === "dark"} onValueChange={toggleTheme} />
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
    panel: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      gap: 12,
      padding: 16
    },
    panelRow: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 74,
      padding: 16
    },
    rowTitle: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12
    },
    label: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900"
    },
    value: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4
    },
    input: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "700",
      minHeight: 48,
      paddingHorizontal: 12
    }
  });
}
