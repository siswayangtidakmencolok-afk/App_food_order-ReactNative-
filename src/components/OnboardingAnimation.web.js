// src/components/OnboardingAnimation.web.js
// Web version — animated badge (no Lottie, no circular import)
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const slideConfig = {
  'food-loading': {
    icon: 'chef-hat',
    accentColor: '#FF6347',
    ringColor: 'rgba(255,99,71,0.15)',
    dotColors: ['#FF6347', '#FFB347', '#FF8C00'],
  },
  'delivery': {
    icon: 'lightning-bolt',
    accentColor: '#FF8C00',
    ringColor: 'rgba(255,140,0,0.15)',
    dotColors: ['#FF8C00', '#FF6347', '#FFD700'],
  },
  'success': {
    icon: 'star-four-points',
    accentColor: '#FFB347',
    ringColor: 'rgba(255,179,71,0.15)',
    dotColors: ['#FFB347', '#FF8C00', '#FF6347'],
  },
};

function OrbitDot({ size, color, angle, radius, floatAnim }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  const offsetY = floatAnim.interpolate({
    inputRange: [-20, 0],
    outputRange: [y - 4, y + 2],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        marginLeft: x - size / 2,
        transform: [{ translateY: offsetY }],
      }}
    />
  );
}

const BADGE_SIZE = 130;

export default function OnboardingAnimation({ name, style }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -16, duration: 1800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const config = slideConfig[name] || slideConfig['food-loading'];

  return (
    <View style={[style, styles.container]}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: config.accentColor,
            transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.middleRing,
          {
            backgroundColor: config.ringColor,
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.badge,
          {
            shadowColor: config.accentColor,
            transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
          },
        ]}
      >
        <View style={[styles.badgeInner, { backgroundColor: '#1a0800' }]}>
          <MaterialCommunityIcons name={config.icon} size={52} color={config.accentColor} />
        </View>
      </Animated.View>

      {config.dotColors.map((color, i) => (
        <OrbitDot
          key={i}
          size={i === 0 ? 10 : i === 1 ? 8 : 6}
          color={color}
          angle={[315, 45, 195][i]}
          radius={[88, 80, 84][i]}
          floatAnim={floatAnim}
        />
      ))}

      <Animated.View
        style={[
          styles.groundShadow,
          {
            opacity: floatAnim.interpolate({ inputRange: [-16, 0], outputRange: [0.04, 0.12] }),
            transform: [{
              scale: floatAnim.interpolate({ inputRange: [-16, 0], outputRange: [0.65, 1.1] }),
            }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  outerRing: {
    position: 'absolute',
    width: BADGE_SIZE + 50,
    height: BADGE_SIZE + 50,
    borderRadius: (BADGE_SIZE + 50) / 2,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  middleRing: {
    position: 'absolute',
    width: BADGE_SIZE + 26,
    height: BADGE_SIZE + 26,
    borderRadius: (BADGE_SIZE + 26) / 2,
  },
  badge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    elevation: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  badgeInner: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundShadow: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
  },
});
