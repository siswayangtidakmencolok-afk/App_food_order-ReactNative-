import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { darkTheme, lightTheme } from './src/config/theme';
import { AppProvider, useApp } from './src/context/AppContext';

// ── Screens ──
import AuthScreen from './src/screens/AuthScreen';
import CartScreen from './src/screens/CartScreen';
import DeliveryTrackerScreen from './src/screens/DeliveryTrackerScreen';
import HomeScreen from './src/screens/HomeScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import MenuDetailScreen from './src/screens/MenuDetailScreen';
import MenuScreen from './src/screens/MenuScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SplashScreen from './src/screens/SplashScreen';

// ── Animated Dock ──
import AnimatedDock from './src/components/AnimatedDock';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Transisi slide dari kanan ──
const slideFromRight = {
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [{
        translateX: current.progress.interpolate({
          inputRange:  [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      }],
      opacity: current.progress.interpolate({
        inputRange:  [0, 0.5, 1],
        outputRange: [0, 0.8, 1],
      }),
    },
  }),
};

// ── Transisi scale dari tengah ──
const scaleFromCenter = {
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      transform: [{
        scale: current.progress.interpolate({
          inputRange:  [0, 1],
          outputRange: [0.85, 1],
        }),
      }],
      opacity: current.progress.interpolate({
        inputRange:  [0, 1],
        outputRange: [0, 1],
      }),
    },
  }),
};

// ── Menu Stack ──
function MenuStack() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:      { backgroundColor: theme.primary },
      headerTintColor:  '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      ...slideFromRight,
    }}>
      <Stack.Screen name="MenuMain"   component={MenuScreen}       options={{ title: 'Menu' }} />
      <Stack.Screen name="MenuDetail" component={MenuDetailScreen} options={{ title: 'Detail Menu', ...scaleFromCenter }} />
    </Stack.Navigator>
  );
}

// ── Cart Stack ──
function CartStack() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <Stack.Navigator screenOptions={{
      headerStyle:      { backgroundColor: theme.primary },
      headerTintColor:  '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
      ...slideFromRight,
    }}>
      <Stack.Screen name="CartMain"        component={CartScreen}            options={{ title: 'Keranjang' }} />
      <Stack.Screen name="Payment"         component={PaymentScreen}         options={{ title: 'Pembayaran' }} />
      <Stack.Screen name="Invoice"         component={InvoiceScreen}         options={{ title: 'Invoice', headerLeft: null, ...scaleFromCenter }} />
      <Stack.Screen name="DeliveryTracker" component={DeliveryTrackerScreen} options={{ title: '🛵 Lacak Pesanan', ...slideFromRight }} />
    </Stack.Navigator>
  );
}

// ── Main Tabs ──
function MainTabs() {
  const {
    cart, orderHistory, favorites,
    isDarkMode, notifications,
    accentColor,  // ← INI yang ditambah
  } = useApp();

  const theme = isDarkMode ? darkTheme : lightTheme;

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;
  const pendingOrders       = orderHistory.filter(o => o.status !== 'Delivered').length;

  const badges = {
    Menu:     favorites.length,
    Cart:     cart.length,
    History:  pendingOrders,
    Profile:  unreadNotifications,
  };

  return (
    <Tab.Navigator
      tabBar={props => (
        <AnimatedDock
          {...props}
          badges={badges}
          accentColor={accentColor}  // ← warna dock ikut tema
        />
      )}
      screenOptions={{
        headerStyle:      { backgroundColor: theme.primary },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle:     { paddingBottom: 90 },
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}        options={{ title: 'Beranda' }} />
      <Tab.Screen name="Menu"     component={MenuStack}         options={{ headerShown: false }} />
      <Tab.Screen name="Cart"     component={CartStack}         options={{ headerShown: false }} />
      <Tab.Screen name="History"  component={OrderHistoryScreen} options={{ title: 'Riwayat' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}     options={{ title: 'Profil' }} />
      <Tab.Screen name="Settings" component={SettingsScreen}    options={{ title: 'Pengaturan' }} />
    </Tab.Navigator>
  );
}

// ── App Content ──
function AppContent() {
  const [showSplash, setShowSplash]         = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { session, authLoading }            = useApp();

  if (showSplash)     return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (showOnboarding) return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  if (authLoading)    return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6347' }}>
      <Text style={{ fontSize: 48 }}>🍔</Text>
    </View>
  );
  if (!session) return <AuthScreen />;

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// ── Root ──
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}