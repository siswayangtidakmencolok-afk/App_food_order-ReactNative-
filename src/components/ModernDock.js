import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';

const TABS = [
  { name: 'Home',    icon: '🏠', label: 'Beranda' },
  { name: 'Menu',    icon: '🍔', label: 'Menu' },
  { name: 'Cart',    icon: '🛒', label: 'Keranjang' },
  { name: 'History', icon: '📋', label: 'Riwayat' },
  { name: 'Profile', icon: '👤', label: 'Profil' },
];

export default function ModernDock({ state, descriptors, navigation, badges = {}, accentColor = '#FF6347' }) {
  return (
    // Outer Container: pointerEvents="box-none" ensures the transparent area doesn't capture touches
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.dockBox}>
        {state.routes.map((route, index) => {
          const tab = TABS.find(t => t.name === route.name) || TABS[0];
          const isFocused = state.index === index;
          const badge = badges[route.name] || 0;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && { backgroundColor: `${accentColor}30` } // 30 is hex for ~20% opacity
              ]}>
                <Text style={[styles.iconText, isFocused && { transform: [{ scale: 1.15 }] }]}>
                  {tab.icon}
                </Text>
                {/* Badge Indicator */}
                {badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                  </View>
                )}
              </View>
              {/* Dot indicator for active tab */}
              {isFocused && (
                <View style={[styles.activeDot, { backgroundColor: accentColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(20,20,20,0.85)' : '#1a1a1a',
    backdropFilter: Platform.OS === 'web' ? 'blur(12px)' : 'none', // Web only
    WebkitBackdropFilter: Platform.OS === 'web' ? 'blur(12px)' : 'none', // Safari Web
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 30, // Pill shape
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabItem: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -2,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
