import { StyleSheet, Text, View } from "react-native";

import { PlantLogo } from "../components/PlantLogo";

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <PlantLogo size={92} />
      <Text style={styles.title}>PlantGuardian IoT</Text>
      <Text style={styles.subtitle}>Smart irrigation system</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#0B3D2E",
    flex: 1,
    justifyContent: "center"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 18
  },
  subtitle: {
    color: "#B7E4CB",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8
  }
});
