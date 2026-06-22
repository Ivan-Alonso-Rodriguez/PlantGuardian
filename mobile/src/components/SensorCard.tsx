import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";

type SensorCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: "ok" | "warn" | "danger" | "info";
};

export function SensorCard({ icon: Icon, label, value, detail, tone = "ok" }: SensorCardProps) {
  const theme = useTheme();
  const toneColor = {
    ok: theme.colors.emerald,
    warn: theme.colors.amber,
    danger: theme.colors.coral,
    info: theme.colors.blue
  }[tone];
  const styles = makeStyles(theme, toneColor);

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Icon color={toneColor} size={20} strokeWidth={2.3} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, toneColor: string) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      minHeight: 92,
      padding: 14,
      width: "48%"
    },
    iconBox: {
      alignItems: "center",
      backgroundColor: `${toneColor}1A`,
      borderRadius: 8,
      height: 38,
      justifyContent: "center",
      width: 38
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    label: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700"
    },
    value: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "900",
      marginTop: 6
    },
    detail: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 4
    }
  });
}
