// src/components/AnimatedDock.native.js
// Versi native — pakai React Native Animated
// Tidak ada magnification (tidak ada mouse), tapi tetap animated

import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = [
  { name: 'Home',    icon: '🏠', label: 'Beranda' },
  { name: 'Menu',    icon: '🍔', label: 'Menu' },
  { name: 'Cart',    icon: '🛒', label: 'Keranjang' },
  { name: 'History', icon: '📋', label: 'Riwayat' },
  { name: 'Profile', icon: '👤', label: 'Profil' },
];

const DockItem = ({ tab, isActive, onPress, badge }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotWidth  = useRef(new Animated.Value(isActive ? 16 : 4)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.85, friction: 5, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: false }).start();
    onPress();
  };

  // Animasi dot saat active berubah
  Animated.spring(dotWidth, {
    toValue: isActive ? 16 : 4,
    friction: 6,
    useNativeDriver: false,
  }).start();

  return (
    <View style={styles.itemWrap}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[
            styles.item,
            isActive && styles.itemActive,
          ]}
        >
          <Text style={styles.itemIcon}>{tab.icon}</Text>
          {badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Active dot */}
      <Animated.View style={[styles.dot, {
        width: dotWidth,
        backgroundColor: isActive ? '#FF6347' : '#666',
        opacity: isActive ? 1 : 0.4,
      }]} />
    </View>
  );
};

export default function AnimatedDock({ state, descriptors, navigation, badges = {} }) {
  return (
    <View style={styles.container}>
      <View style={styles.dock}>
        {state.routes.map((route, index) => {
          const tab      = TABS.find(t => t.name === route.name) || TABS[0];
          const isActive = state.index === index;
          const badge    = badges[route.name] || 0;

          return (
            <DockItem
              key={route.key}
              tab={tab}
              isActive={isActive}
              badge={badge}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 12, zIndex: 999 },
  dock:        { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(10,10,10,0.9)', borderRadius: 22, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  itemWrap:    { alignItems: 'center' },
  item:        { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  itemActive:  { backgroundColor: 'rgba(255,99,71,0.25)', borderColor: 'rgba(255,99,71,0.6)' },
  itemIcon:    { fontSize: 22 },
  badge:       { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FF6347', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#0a0a0a' },
  badgeTxt:    { fontSize: 9, fontWeight: '800', color: '#fff' },
  dot:         { height: 3, borderRadius: 2, marginTop: 5 },
});