import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import { Text, View } from 'react-native';

// Context Provider
import { AppProvider, useApp } from './src/context/AppContext';

// Screens
import CartScreen from './src/screens/CartScreen';
import HomeScreen from './src/screens/HomeScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import MenuDetailScreen from './src/screens/MenuDetailScreen';
import MenuScreen from './src/screens/MenuScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';

// Theme
import { darkTheme, lightTheme } from './src/config/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Icon Component
const TabIcon = ({ icon, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: focused ? 28 : 24 }}>{icon}</Text>
  </View>
);

// Menu Stack Navigator
function MenuStack() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="MenuMain" 
        component={MenuScreen}
        options={{ title: 'Menu' }}
      />
      <Stack.Screen 
        name="MenuDetail" 
        component={MenuDetailScreen}
        options={{ title: 'Detail Menu' }}
      />
    </Stack.Navigator>
  );
}

// Cart Stack Navigator
function CartStack() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="CartMain" 
        component={CartScreen}
        options={{ title: 'Keranjang' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Pembayaran' }}
      />
      <Stack.Screen 
        name="Invoice" 
        component={InvoiceScreen}
        options={{ 
          title: 'Invoice',
          headerLeft: null,
        }}
      />
    </Stack.Navigator>
  );
}

// Main Tabs
function MainTabs() {
  const { cart, orderHistory, favorites, isDarkMode, notifications } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const pendingOrders = orderHistory.filter(o => o.status !== 'Delivered').length;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        headerStyle: { 
          backgroundColor: theme.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Beranda',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Menu"
        component={MenuStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🍔" focused={focused} />
          ),
          tabBarBadge: favorites.length > 0 ? favorites.length : null,
          tabBarBadgeStyle: {
            backgroundColor: '#4CAF50',
            fontSize: 10,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
          },
        }}
      />
      
      <Tab.Screen 
        name="Cart"
        component={CartStack}
        options={{
          title: 'Keranjang',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🛒" focused={focused} />
          ),
          tabBarBadge: cart.length > 0 ? cart.length : null,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            fontSize: 10,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
          },
        }}
      />
      
      <Tab.Screen 
        name="History"
        component={OrderHistoryScreen}
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} />
          ),
          tabBarBadge: pendingOrders > 0 ? pendingOrders : null,
          tabBarBadgeStyle: {
            backgroundColor: '#2196F3',
            fontSize: 10,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
          },
        }}
      />
      
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : null,
          tabBarBadgeStyle: {
            backgroundColor: '#f44336',
            fontSize: 10,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
          },
        }}
      />
    </Tab.Navigator>
  );
}

// App Content with Splash
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true); // Should ideally be checked via AsyncStorage

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// Main App with Provider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}