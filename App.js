import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider, useApp } from './src/context/AppContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import CartScreen from './src/screens/CartScreen';
import DeliveryTrackerScreen from './src/screens/DeliveryTrackerScreen';
import GatewayScreen from './src/screens/GatewayScreen';
import HomeScreen from './src/screens/HomeScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import MenuDetailScreen from './src/screens/MenuDetailScreen';
import MenuScreen from './src/screens/MenuScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PromoHubScreen from './src/screens/PromoHubScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ONBOARDING_KEY = '@has_seen_onboarding';

// ── Bottom Tab Navigator (konten screen saja, tab bar dihandle di RootNavigator) ─
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // disembunyikan, pakai persistent tab bar di RootNavigator
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// ── Root Navigator ────────────────────────────────────────────────
const RootNavigator = () => {
  const { session, authLoading, isDarkMode, cart } = useApp();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navRef = useNavigationContainerRef();
  const [activeRoute, setActiveRoute] = useState('Home');

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setShowOnboarding(val === null);
      setOnboardingChecked(true);
    }).catch(() => {
      setShowOnboarding(false);
      setOnboardingChecked(true);
    });
  }, []);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'done');
    setShowOnboarding(false);
  };

  if (!onboardingChecked || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  const tabBarBg = isDarkMode ? '#1e1e1e' : '#ffffff';
  const activeColor = '#825100';
  const inactiveColor = isDarkMode ? '#888' : '#a0998f';
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const TAB_ROUTES = ['Home', 'Menu', 'Cart', 'OrderHistory', 'Profile'];
  const tabs = [
    { name: 'Home',         label: 'Beranda',    icon: 'home' },
    { name: 'Menu',         label: 'Menu',       icon: 'silverware-fork-knife' },
    { name: 'Cart',         label: 'Keranjang',  icon: 'cart', badge: cartCount },
    { name: 'OrderHistory', label: 'Pesanan',    icon: 'receipt' },
    { name: 'Profile',      label: 'Profil',     icon: 'account-circle' },
  ];

  // Tab bar selalu tampil saat logged in di semua halaman

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navRef}
        onReady={() => setActiveRoute(navRef.getCurrentRoute()?.name || 'Home')}
        onStateChange={() => setActiveRoute(navRef.getCurrentRoute()?.name || 'Home')}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Gateway" component={GatewayScreen} />
              <Stack.Screen name="DeliveryTracker" component={DeliveryTrackerScreen} />
              <Stack.Screen name="Invoice" component={InvoiceScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="PromoHub" component={PromoHubScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Persistent bottom tab bar — muncul di semua halaman saat login */}
      {!!session && (
        <View style={{
          flexDirection: 'row',
          backgroundColor: tabBarBg,
          borderTopColor: isDarkMode ? '#2c2c2c' : '#f0e8df',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        }}>
          {tabs.map(tab => {
            const isActive = activeRoute === tab.name;
            return (
              <TouchableOpacity
                key={tab.name}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => navRef.navigate(tab.name)}
              >
                <View style={{ position: 'relative' }}>
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={24}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  {tab.badge > 0 && (
                    <View style={{
                      position: 'absolute', top: -4, right: -6,
                      backgroundColor: '#EE4D2D', borderRadius: 8,
                      minWidth: 16, height: 16,
                      justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2,
                    }}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: isActive ? activeColor : inactiveColor, marginTop: 2 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Floating overlays — hanya tampil saat sudah login */}
      {!!session && (
        <>
          <GameCenter />
          <AIChatBubble />
        </>
      )}
    </View>
  );
};

// ── Entry Point ───────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
