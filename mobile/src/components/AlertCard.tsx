import { AlertTriangle, Info } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { HealthAlert } from "../types/api";

type AlertCardProps = {
  alert: HealthAlert;
};

export function AlertCard({ alert }: AlertCardProps) {
  const theme = useTheme();
  const color = alert.severity === "critical"
    ? theme.colors.coral
    : alert.severity === "warning"
      ? theme.colors.amber
      : theme.colors.blue;
  const Icon = alert.severity === "info" ? Info : AlertTriangle;
  const styles = makeStyles(theme, color);

  return (
    <View style={styles.card}>
      <Icon color={color} size={20} strokeWidth={2.3} />
      <View style={styles.copy}>
        <Text style={styles.title}>{alert.severity.toUpperCase()}</Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, color: string) {
  return StyleSheet.create({
    card: {
      alignItems: "flex-start",
      backgroundColor: theme.colors.surface,
      borderColor: color,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      padding: 14
    },
    copy: {
      flex: 1
    },
    title: {
      color,
      fontSize: 11,
      fontWeight: "900"
    },
    message: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4
    }
  });
}
