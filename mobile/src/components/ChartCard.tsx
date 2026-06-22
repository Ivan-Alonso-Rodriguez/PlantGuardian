import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

import { useTheme } from "../theme/useTheme";

type ChartCardProps = {
  title: string;
  values: number[];
  color?: string;
};

export function ChartCard({ title, values, color }: ChartCardProps) {
  const theme = useTheme();
  const chartColor = color ?? theme.colors.emerald;
  const width = 300;
  const height = 110;
  const safeValues = values.length > 1 ? values : [0, 0];
  const points = safeValues
    .map((value, index) => {
      const x = (index / (safeValues.length - 1)) * width;
      const y = height - (Math.max(0, Math.min(value, 100)) / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const styles = makeStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline points={points} fill="none" stroke={chartColor} strokeWidth="4" strokeLinecap="round" />
        {safeValues.map((value, index) => {
          const x = (index / (safeValues.length - 1)) * width;
          const y = height - (Math.max(0, Math.min(value, 100)) / 100) * height;
          return <Circle key={`${index}-${value}`} cx={x} cy={y} r="3" fill={chartColor} />;
        })}
      </Svg>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      padding: 14
    },
    title: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 12
    }
  });
}
