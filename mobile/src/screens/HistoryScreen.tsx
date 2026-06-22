import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChartCard } from "../components/ChartCard";
import { createApiClient } from "../services/apiClient";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/useTheme";
import { SensorReading } from "../types/api";
import { percent, shortTime } from "../utils/format";

export function HistoryScreen() {
  const theme = useTheme();
  const apiBaseUrl = useSettingsStore((state) => state.apiBaseUrl);
  const api = useMemo(() => createApiClient(apiBaseUrl), [apiBaseUrl]);
  const [items, setItems] = useState<SensorReading[]>([]);
  const styles = makeStyles(theme);

  useEffect(() => {
    api.getHistory(60).then((data) => setItems(data.items)).catch(() => setItems([]));
  }, [api]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id ?? index}-${item.created_at ?? index}`}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.header}>
              <Text style={styles.title}>Historial</Text>
              <Text style={styles.subtitle}>{items.length} registros</Text>
            </View>
            <ChartCard title="Evolucion de suelo" values={items.map((item) => item.hum_p1).reverse()} color={theme.colors.emerald} />
          </View>
        }
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.time}>{shortTime(item.created_at)}</Text>
              <Text style={styles.mode}>{item.modo}</Text>
            </View>
            <View style={styles.metrics}>
              <Text style={styles.metric}>P1 {percent(item.hum_p1)}</Text>
              <Text style={styles.metric}>P2 {percent(item.hum_p2)}</Text>
              <Text style={styles.metric}>Agua {percent(item.agua)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sin lecturas registradas.</Text>}
      />
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: {
      backgroundColor: theme.colors.background,
      flex: 1
    },
    content: {
      gap: 12,
      padding: 18,
      paddingBottom: 34
    },
    headerWrap: {
      gap: 14
    },
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
    row: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 72,
      padding: 14
    },
    time: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "900"
    },
    mode: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4
    },
    metrics: {
      alignItems: "flex-end",
      gap: 3
    },
    metric: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800"
    },
    empty: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "700"
    }
  });
}
