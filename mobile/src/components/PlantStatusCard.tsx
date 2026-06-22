import { Droplets, Sprout } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { MetricRing } from "./MetricRing";

type PlantStatusCardProps = {
  name: string;
  humidity: number;
  dry: boolean;
  watering: boolean;
};

export function PlantStatusCard({ name, humidity, dry, watering }: PlantStatusCardProps) {
  const theme = useTheme();
  const color = dry ? theme.colors.coral : watering ? theme.colors.blue : theme.colors.emerald;
  const styles = makeStyles(theme, color);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Sprout color={color} size={22} strokeWidth={2.3} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.state}>{watering ? "Regando" : dry ? "Necesita agua" : "Estable"}</Text>
        </View>
        <Droplets color={color} size={20} />
      </View>
      <MetricRing value={humidity} label="Suelo" color={color} />
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, color: string) {
  return StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      gap: 12,
      padding: 14,
      width: "48%"
    },
    top: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      width: "100%"
    },
    icon: {
      alignItems: "center",
      backgroundColor: `${color}1A`,
      borderRadius: 8,
      height: 36,
      justifyContent: "center",
      width: 36
    },
    copy: {
      flex: 1,
      minWidth: 0
    },
    name: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "900"
    },
    state: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 3
    }
  });
}
