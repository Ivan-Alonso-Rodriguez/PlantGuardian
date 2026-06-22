import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";

type ControlButtonProps = {
  icon: LucideIcon;
  label: string;
  variant?: "primary" | "danger" | "neutral";
  disabled?: boolean;
  onPress: () => void;
};

export function ControlButton({
  icon: Icon,
  label,
  variant = "neutral",
  disabled,
  onPress
}: ControlButtonProps) {
  const theme = useTheme();
  const color = variant === "primary"
    ? theme.colors.emerald
    : variant === "danger"
      ? theme.colors.coral
      : theme.colors.petrol;
  const styles = makeStyles(theme, color, Boolean(disabled));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Icon color="#FFFFFF" size={21} strokeWidth={2.4} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, color: string, disabled: boolean) {
  return StyleSheet.create({
    button: {
      alignItems: "center",
      backgroundColor: disabled ? theme.colors.surfaceMuted : theme.colors.surface,
      borderColor: disabled ? theme.colors.border : color,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      minHeight: 58,
      opacity: disabled ? 0.58 : 1,
      paddingHorizontal: 14,
      width: "100%"
    },
    pressed: {
      transform: [{ scale: 0.99 }]
    },
    icon: {
      alignItems: "center",
      backgroundColor: color,
      borderRadius: 8,
      height: 36,
      justifyContent: "center",
      width: 36
    },
    label: {
      color: theme.colors.text,
      flex: 1,
      fontSize: 15,
      fontWeight: "800"
    }
  });
}
