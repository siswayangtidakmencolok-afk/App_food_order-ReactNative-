// src/components/PillNav.native.js
// Native fallback for PillNav using Animated API
// Designed to be used as a footer menu

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedLogo from './AnimatedLogo';

const TABS_METADATA = [
  { name: 'Home',    icon: 'home', label: 'Home' },
  { name: 'Menu',    icon: 'food', label: 'Menu' },
  { name: 'Cart',    icon: 'cart', label: 'Cart' },
  { name: 'History', icon: 'clipboard-list', label: 'Orders' },
  { name: 'Profile', icon: 'account', label: 'Profile' },
];

const PillNav = ({ state, navigation, badges = {}, accentColor = '#EE4D2D' }) => {
  const isDarkMode = true; // Based on apps context usually
  const bg = '#000';
  const pillBg = '#fff';
  const pillText = '#000';

  return (
    <View style={styles.container}>
      <View style={[styles.nav, { backgroundColor: bg }]}>
        
        {/* LOGO */}
        <View style={styles.logoWrap}>
          <AnimatedLogo size={20} />
        </View>

        <View style={styles.list}>
          {state.routes.map((route, index) => {
            const meta = TABS_METADATA.find(t => t.name === route.name);
            if (!meta) return null;

            const isFocused = state.index === index;
            const badge = badges[route.name] || 0;

            const onPress = () => {
              navigation.navigate(route.name);
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[
                  styles.pill,
                  { backgroundColor: isFocused ? bg : pillBg },
                  isFocused && styles.pillFocused
                ]}
              >
                <MaterialCommunityIcons 
                  name={meta.icon} 
                  size={18} 
                  color={isFocused ? '#fff' : pillText} 
                />
                <Text style={[styles.label, { color: isFocused ? '#fff' : pillText }]}>
                  {meta.label}
                </Text>
                
                {badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: accentColor }]}>
                    <Text style={styles.badgeTxt}>{badge > 9 ? '9+' : badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  logoWrap: {
    marginRight: 6,
    marginLeft: 4,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillFocused: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 8,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTxt: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  }
});

export default PillNav;
