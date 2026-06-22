import { StyleSheet, Text, View } from "react-native";

import { statusColors } from "../theme/theme";
import { useTheme } from "../theme/useTheme";
import { SystemStatus } from "../types/api";

type StatusBadgeProps = {
  status: SystemStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useTheme();
  const color = statusColors[status] ?? theme.colors.textMuted;
  const styles = makeStyles(color, theme.colors.surface);

  return (
    <View style={styles.badge}>
      <View style={styles.dot} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

function makeStyles(color: string, surface: string) {
  return StyleSheet.create({
    badge: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: surface,
      borderColor: color,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      gap: 8,
      minHeight: 32,
      paddingHorizontal: 12
    },
    dot: {
      backgroundColor: color,
      borderRadius: 5,
      height: 10,
      width: 10
    },
    text: {
      color,
      fontSize: 12,
      fontWeight: "800"
    }
  });
}
