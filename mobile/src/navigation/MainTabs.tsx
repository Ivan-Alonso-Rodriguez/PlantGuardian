import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart3, Gauge, History, Settings, SlidersHorizontal } from "lucide-react-native";

import { ControlScreen } from "../screens/ControlScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { SensorDetailsScreen } from "../screens/SensorDetailsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { useTheme } from "../theme/useTheme";

export type MainTabParamList = {
  Dashboard: undefined;
  Sensors: undefined;
  Control: undefined;
  History: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons = {
  Dashboard: Gauge,
  Sensors: BarChart3,
  Control: SlidersHorizontal,
  History,
  Settings
};

export function MainTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = icons[route.name];
        return {
          headerShown: false,
          tabBarActiveTintColor: theme.colors.emerald,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700"
          },
          tabBarIcon: ({ color, size }) => (
            <Icon color={color} size={size} strokeWidth={2.2} />
          )
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Panel" }} />
      <Tab.Screen name="Sensors" component={SensorDetailsScreen} options={{ title: "Sensores" }} />
      <Tab.Screen name="Control" component={ControlScreen} options={{ title: "Control" }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Historial" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
    </Tab.Navigator>
  );
}
