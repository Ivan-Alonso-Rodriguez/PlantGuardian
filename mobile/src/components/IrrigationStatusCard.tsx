import { Droplets, Sprout } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { SensorReading } from "../types/api";
import { getIrrigationState } from "../utils/irrigation";

type IrrigationStatusCardProps = {
  reading?: SensorReading | null;
};

export function IrrigationStatusCard({ reading }: IrrigationStatusCardProps) {
  const theme = useTheme();
  const state = getIrrigationState(reading);
  const color = state.active ? theme.colors.blue : theme.colors.textMuted;
  const styles = makeStyles(theme, color, state.active);

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        {state.active ? (
          <Droplets color="#FFFFFF" size={22} strokeWidth={2.4} />
        ) : (
          <Sprout color="#FFFFFF" size={22} strokeWidth={2.4} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>Riego actual</Text>
        <Text style={styles.value}>{state.plantLabel}</Text>
        <Text style={styles.detail}>{state.detail}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{state.active ? "ON" : "OFF"}</Text>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, color: string, active: boolean) {
  return StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: active ? `${color}18` : theme.colors.surface,
      borderColor: active ? color : theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      minHeight: 82,
      padding: 14
    },
    iconBox: {
      alignItems: "center",
      backgroundColor: color,
      borderRadius: 8,
      height: 42,
      justifyContent: "center",
      width: 42
    },
    copy: {
      flex: 1,
      minWidth: 0
    },
    label: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800"
    },
    value: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 4
    },
    detail: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 3
    },
    pill: {
      alignItems: "center",
      borderColor: color,
      borderRadius: 999,
      borderWidth: 1,
      minWidth: 46,
      paddingHorizontal: 10,
      paddingVertical: 5
    },
    pillText: {
      color,
      fontSize: 11,
      fontWeight: "900"
    }
  });
}
