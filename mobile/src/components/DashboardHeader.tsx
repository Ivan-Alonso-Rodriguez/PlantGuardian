import { RefreshCw, Wifi } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { SystemStatus } from "../types/api";
import { StatusBadge } from "./StatusBadge";

type DashboardHeaderProps = {
  status: SystemStatus;
  connected: boolean;
  onRefresh: () => void;
};

export function DashboardHeader({ status, connected, onRefresh }: DashboardHeaderProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>PlantGuardian IoT</Text>
        <Text style={styles.title}>Riego inteligente</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.connection}>
          <Wifi color={connected ? theme.colors.emerald : theme.colors.textMuted} size={18} />
        </View>
        <Pressable accessibilityRole="button" onPress={onRefresh} style={styles.refresh}>
          <RefreshCw color={theme.colors.text} size={18} />
        </Pressable>
      </View>
      <View style={styles.badgeRow}>
        <StatusBadge status={status} />
      </View>
    </View>
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
    kicker: {
      color: theme.colors.emerald,
      fontSize: 12,
      fontWeight: "900"
    },
    title: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 4
    },
    actions: {
      flexDirection: "row",
      gap: 8,
      position: "absolute",
      right: 14,
      top: 14
    },
    connection: {
      alignItems: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 8,
      height: 36,
      justifyContent: "center",
      width: 36
    },
    refresh: {
      alignItems: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 8,
      height: 36,
      justifyContent: "center",
      width: 36
    },
    badgeRow: {
      marginTop: 18
    }
  });
}
