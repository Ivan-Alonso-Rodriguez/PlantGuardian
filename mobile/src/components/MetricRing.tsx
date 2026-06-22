import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "../theme/useTheme";

type MetricRingProps = {
  value: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
};

export function MetricRing({ value, label, unit = "%", color, size = 104 }: MetricRingProps) {
  const theme = useTheme();
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(value, 100));
  const offset = circumference - (clamped / 100) * circumference;
  const ringColor = color ?? theme.colors.emerald;
  const styles = makeStyles(theme.colors.text, theme.colors.textMuted);

  return (
    <View style={[styles.wrap, { height: size, width: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceMuted}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(value)}{unit}</Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}

function makeStyles(text: string, textMuted: string) {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      justifyContent: "center"
    },
    center: {
      alignItems: "center",
      position: "absolute"
    },
    value: {
      color: text,
      fontSize: 20,
      fontWeight: "900"
    },
    label: {
      color: textMuted,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
      maxWidth: 82
    }
  });
}
