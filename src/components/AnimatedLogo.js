// src/components/AnimatedLogo.js
// Logo animasi: piring muncul → garpu & pisau masuk miring dari luar
// Pure React Native Animated — tidak butuh library tambahan

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function AnimatedLogo({ size = 90 }) {
  // ── Animasi plate (piring) ────────────────────────────
  const plateScale   = useRef(new Animated.Value(0)).current;
  const plateOpacity = useRef(new Animated.Value(0)).current;

  // ── Animasi fork (garpu) — masuk dari kiri bawah ─────
  const forkX     = useRef(new Animated.Value(-60)).current;
  const forkY     = useRef(new Animated.Value(60)).current;
  const forkOpacity = useRef(new Animated.Value(0)).current;

  // ── Animasi knife (pisau) — masuk dari kanan atas ────
  const knifeX      = useRef(new Animated.Value(60)).current;
  const knifeY      = useRef(new Animated.Value(-60)).current;
  const knifeOpacity = useRef(new Animated.Value(0)).current;

  // ── Glow pulse loop ───────────────────────────────────
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ── Border rotating ───────────────────────────────────
  const borderRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Piring muncul duluan
    Animated.parallel([
      Animated.spring(plateScale, {
        toValue: 1, friction: 4, delay: 100, useNativeDriver: false,
      }),
      Animated.timing(plateOpacity, {
        toValue: 1, duration: 400, delay: 100, useNativeDriver: false,
      }),
    ]).start();

    // 2. Garpu masuk dari kiri bawah setelah piring muncul
    Animated.parallel([
      Animated.spring(forkX, {
        toValue: 0, friction: 5, delay: 500, useNativeDriver: false,
      }),
      Animated.spring(forkY, {
        toValue: 0, friction: 5, delay: 500, useNativeDriver: false,
      }),
      Animated.timing(forkOpacity, {
        toValue: 1, duration: 300, delay: 500, useNativeDriver: false,
      }),
    ]).start();

    // 3. Pisau masuk dari kanan atas
    Animated.parallel([
      Animated.spring(knifeX, {
        toValue: 0, friction: 5, delay: 650, useNativeDriver: false,
      }),
      Animated.spring(knifeY, {
        toValue: 0, friction: 5, delay: 650, useNativeDriver: false,
      }),
      Animated.timing(knifeOpacity, {
        toValue: 1, duration: 300, delay: 650, useNativeDriver: false,
      }),
    ]).start();

    // 4. Glow pulse — loop terus
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: false }),
      ])
    ).start();

    // 5. Border rotate — loop terus
    Animated.loop(
      Animated.timing(borderRotate, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });
  const borderDeg   = borderRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.wrapper, { width: size + 50, height: size + 50 }]}>

      {/* ── Glow ring luar — pulse ── */}
      <Animated.View style={[
        styles.glowRing,
        {
          width: size + 40,
          height: size + 40,
          borderRadius: (size + 40) / 2,
          transform: [{ scale: glowScale }],
          opacity: glowOpacity,
        }
      ]} />

      {/* ── Border berputar (dashed-like) ── */}
      <Animated.View style={[
        styles.rotateBorder,
        {
          width: size + 20,
          height: size + 20,
          borderRadius: (size + 20) / 2,
          transform: [{ rotate: borderDeg }],
        }
      ]} />

      {/* ── Plate (piring) ── */}
      <Animated.View style={[
        styles.plate,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: plateScale }],
          opacity: plateOpacity,
        }
      ]}>
        {/* Inner ring piring */}
        <View style={[
          styles.plateInner,
          { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36 }
        ]} />
        <View style={[
          styles.plateInner2,
          { width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225 }
        ]} />
      </Animated.View>

      {/* ── Fork (garpu) — miring 45deg, masuk dari kiri bawah ── */}
      <Animated.View style={[
        styles.utensil,
        {
          transform: [
            { translateX: forkX },
            { translateY: forkY },
            { rotate: '-45deg' },
          ],
          opacity: forkOpacity,
        }
      ]}>
        <Text style={{ fontSize: size * 0.38, color: '#fff' }}>🍴</Text>
      </Animated.View>

      {/* ── Knife (pisau) — miring 45deg, masuk dari kanan atas ── */}
      <Animated.View style={[
        styles.utensil,
        {
          transform: [
            { translateX: knifeX },
            { translateY: knifeY },
            { rotate: '45deg' },
          ],
          opacity: knifeOpacity,
        }
      ]}>
        <Text style={{ fontSize: size * 0.32, color: '#fff' }}>🔪</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:      { justifyContent: 'center', alignItems: 'center', position: 'relative' },

  // Glow
  glowRing:     { position: 'absolute', backgroundColor: 'rgba(255,120,60,0.35)' },

  // Rotating border — pakai borderStyle dashed simulation dengan opacity
  rotateBorder: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },

  // Plate
  plate:        {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateInner:   {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  plateInner2:  {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Utensil
  utensil:      { position: 'absolute' },
});