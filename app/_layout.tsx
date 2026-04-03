// app/_layout.tsx
// Root layout untuk Expo Router - tanpa Stack karena App.js sudah punya NavigationContainer

import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Slot />
    </View>
  );
}
