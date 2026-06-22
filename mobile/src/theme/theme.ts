export type ThemeMode = "light" | "dark";

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    border: string;
    forest: string;
    emerald: string;
    petrol: string;
    blue: string;
    amber: string;
    coral: string;
    success: string;
    shadow: string;
  };
  radius: {
    sm: number;
    md: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    background: "#F5F7F6",
    surface: "#FFFFFF",
    surfaceMuted: "#EAF0EC",
    text: "#18251F",
    textMuted: "#64736B",
    border: "#DDE6E1",
    forest: "#0B3D2E",
    emerald: "#20A66B",
    petrol: "#125E63",
    blue: "#2F6FED",
    amber: "#D98A1F",
    coral: "#D85C57",
    success: "#1C8F5A",
    shadow: "#10251B"
  },
  radius: {
    sm: 6,
    md: 8
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30
  }
};

export const darkTheme: AppTheme = {
  ...lightTheme,
  mode: "dark",
  colors: {
    ...lightTheme.colors,
    background: "#101614",
    surface: "#18201D",
    surfaceMuted: "#22312B",
    text: "#EEF6F1",
    textMuted: "#A9B8B0",
    border: "#2D3A35",
    shadow: "#000000"
  }
};

export const statusColors = {
  EXCELENTE: "#1C8F5A",
  ESTABLE: "#125E63",
  ATENCION: "#D98A1F",
  CRITICO: "#D85C57",
  SIN_DATOS: "#64736B"
} as const;