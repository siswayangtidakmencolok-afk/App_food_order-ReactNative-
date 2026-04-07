import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

// Tab yang ingin ditampilkan (maksimal 5, sesuai screenshot)
const TABS = [
  { name: 'Home',    icon: '🏠', label: 'Beranda' },
  { name: 'Menu',    icon: '🍔', label: 'Menu' },
  { name: 'Cart',    icon: '🛒', label: 'Keranjang' },
  { name: 'History', icon: '📋', label: 'Riwayat' },
  { name: 'Profile', icon: '👤', label: 'Profil' },
];

export default function ModernDock({ state, descriptors, navigation, badges = {}, accentColor = '#FF6347' }) {
  // Filter hanya route yang ada di TABS (buang Settings, PromoHub, dll)
  const visibleRoutes = state.routes.filter(r => TABS.some(t => t.name === r.name));

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {visibleRoutes.map((route) => {
          const tab = TABS.find(t => t.name === route.name);
          if (!tab) return null;

          const index = state.routes.indexOf(route);
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
              activeOpacity={0.65}
            >
              {/* Icon + Badge */}
              <View style={styles.iconWrap}>
                <Text style={[styles.icon, isFocused && styles.iconFocused]}>
                  {tab.icon}
                </Text>
                {badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeTxt}>{badge > 9 ? '9+' : badge}</Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? accentColor : '#999' },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {/* Active underline dot */}
              {isFocused && (
                <View style={[styles.activeLine, { backgroundColor: accentColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Full-width bar stuck to bottom — NOT floating pill
    backgroundColor: Platform.OS === 'web' ? 'rgba(14,14,14,0.97)' : '#141414',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingTop: 6,
    // Web safe-area
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }),
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    minWidth: 0,
  },
  iconWrap: {
    position: 'relative',
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.55,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
    left: '50%',
    marginLeft: -12,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#141414',
  },
  badgeTxt: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
