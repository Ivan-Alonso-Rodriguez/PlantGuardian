import { Lock, Mail } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PlantLogo } from "../components/PlantLogo";
import { useTheme } from "../theme/useTheme";

type LoginScreenProps = {
  onSignIn: () => void;
};

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.brand}>
        <PlantLogo size={76} />
        <Text style={styles.title}>PlantGuardian IoT</Text>
        <Text style={styles.subtitle}>Monitoreo de riego</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrap}>
          <Mail color={theme.colors.textMuted} size={20} />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="correo@plantguardian.dev"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            value="demo@plantguardian.dev"
          />
        </View>
        <View style={styles.inputWrap}>
          <Lock color={theme.colors.textMuted} size={20} />
          <TextInput
            placeholder="contrasena"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.input}
            value="plantguardian"
          />
        </View>
        <Pressable accessibilityRole="button" onPress={onSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safe: {
      backgroundColor: theme.colors.background,
      flex: 1,
      justifyContent: "center",
      padding: 22
    },
    brand: {
      alignItems: "center",
      marginBottom: 28
    },
    title: {
      color: theme.colors.text,
      fontSize: 30,
      fontWeight: "900",
      marginTop: 16
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 6
    },
    form: {
      gap: 12
    },
    inputWrap: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: 10,
      minHeight: 56,
      paddingHorizontal: 14
    },
    input: {
      color: theme.colors.text,
      flex: 1,
      fontSize: 15,
      fontWeight: "700"
    },
    button: {
      alignItems: "center",
      backgroundColor: theme.colors.emerald,
      borderRadius: theme.radius.md,
      justifyContent: "center",
      minHeight: 56,
      marginTop: 6
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900"
    }
  });
}
