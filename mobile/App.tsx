import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoginScreen } from "./src/screens/LoginScreen";
import { SplashScreen } from "./src/screens/SplashScreen";
import { MainTabs } from "./src/navigation/MainTabs";
import { useSettingsStore } from "./src/store/settingsStore";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const themeMode = useSettingsStore((state) => state.themeMode);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 900);
    return () => clearTimeout(timer);
  }, []);

  let content = <SplashScreen />;

  if (booted && !signedIn) {
    content = <LoginScreen onSignIn={() => setSignedIn(true)} />;
  }

  if (booted && signedIn) {
    content = (
      <NavigationContainer>
        <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
        <MainTabs />
      </NavigationContainer>
    );
  }

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}