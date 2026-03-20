// src/screens/SplashScreen.js
// Cinematic 3-stage loading — setiap stage punya personality berbeda
// Stage 1: Logo reveal dengan particle burst
// Stage 2: Brand story — tagline muncul satu per satu  
// Stage 3: Loading bar sinematik + "Siap masuk" sebelum ke login

import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, StyleSheet,
  Text, View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Particle Burst ───────────────────────────────────────────
// Partikel meledak keluar dari tengah saat logo muncul
const Particle = ({ delay, angle, distance, color, size }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0)).current;

  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.spring(scale,   { toValue: 1, friction: 4,   useNativeDriver: false }),
        Animated.spring(translateX, { toValue: targetX, friction: 5, useNativeDriver: false }),
        Animated.spring(translateY, { toValue: targetY, friction: 5, useNativeDriver: false }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    }} />
  );
};

// ─── Typewriter satu baris ─────────────────────────────────────
const TypeLine = ({ text, style, delay, speed = 60, onDone }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          onDone?.();
        }
      }, speed);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(start);
  }, []);

  return <Text style={style}>{displayed}<Text style={{ opacity: 0.6 }}>|</Text></Text>;
};

// ─── Stage 1: Logo Cinematic Reveal ──────────────────────────
const Stage1 = ({ onDone }) => {
  const ringScale1  = useRef(new Animated.Value(0)).current;
  const ringScale2  = useRef(new Animated.Value(0)).current;
  const ringScale3  = useRef(new Animated.Value(0)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;
  const ringOpacity3 = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const forkAnim    = useRef(new Animated.Value(-80)).current;
  const knifeAnim   = useRef(new Animated.Value(80)).current;
  const glowPulse   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Partikel burst — 16 partikel
  const PARTICLES = Array.from({ length: 16 }).map((_, i) => ({
    angle:    (i / 16) * Math.PI * 2,
    distance: 80 + Math.random() * 60,
    color:    i % 3 === 0 ? '#FFB347' : i % 3 === 1 ? '#FF6347' : '#fff',
    size:     Math.random() * 8 + 4,
    delay:    600 + Math.random() * 100,
  }));

  useEffect(() => {
    // Ring 1 — expand pertama
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(ringScale1, { toValue: 1, friction: 4, useNativeDriver: false }),
        Animated.timing(ringOpacity1, { toValue: 0.6, duration: 400, useNativeDriver: false }),
      ]),
    ]).start();

    // Ring 2 — expand lebih lambat
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.spring(ringScale2, { toValue: 1, friction: 5, useNativeDriver: false }),
        Animated.timing(ringOpacity2, { toValue: 0.4, duration: 500, useNativeDriver: false }),
      ]),
    ]).start();

    // Ring 3
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(ringScale3, { toValue: 1, friction: 6, useNativeDriver: false }),
        Animated.timing(ringOpacity3, { toValue: 0.2, duration: 600, useNativeDriver: false }),
      ]),
    ]).start();

    // Logo plate muncul
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, useNativeDriver: false }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]),
    ]).start();

    // Garpu masuk dari kiri
    Animated.sequence([
      Animated.delay(700),
      Animated.spring(forkAnim, { toValue: 0, friction: 5, useNativeDriver: false }),
    ]).start();

    // Pisau masuk dari kanan
    Animated.sequence([
      Animated.delay(800),
      Animated.spring(knifeAnim, { toValue: 0, friction: 5, useNativeDriver: false }),
    ]).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowPulse, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    ).start();

    // Fade out ke stage 2
    Animated.sequence([
      Animated.delay(2400),
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start(() => onDone?.());
  }, []);

  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const glowOp    = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });

  return (
    <Animated.View style={[styles.stageContainer, { opacity: screenOpacity, backgroundColor: '#0a0a0a' }]}>

      {/* Starfield background — titik titik kecil */}
      {Array.from({ length: 30 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute',
          left: Math.random() * width,
          top:  Math.random() * height,
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          borderRadius: 1,
          backgroundColor: `rgba(255,255,255,${Math.random() * 0.3 + 0.05})`,
        }} />
      ))}

      <View style={styles.logoArea}>
        {/* Partikel burst */}
        {PARTICLES.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        {/* Ring 3 — paling luar */}
        <Animated.View style={[styles.ring, {
          width: 220, height: 220, borderRadius: 110,
          borderColor: '#FF6347',
          transform: [{ scale: ringScale3 }],
          opacity: ringOpacity3,
        }]} />

        {/* Ring 2 */}
        <Animated.View style={[styles.ring, {
          width: 170, height: 170, borderRadius: 85,
          borderColor: '#FF8C00',
          transform: [{ scale: ringScale2 }],
          opacity: ringOpacity2,
        }]} />

        {/* Ring 1 — paling dalam */}
        <Animated.View style={[styles.ring, {
          width: 130, height: 130, borderRadius: 65,
          borderColor: '#FFB347',
          transform: [{ scale: ringScale1 }],
          opacity: ringOpacity1,
        }]} />

        {/* Glow */}
        <Animated.View style={[styles.glow, {
          transform: [{ scale: glowScale }],
          opacity: glowOp,
        }]} />

        {/* Plate logo */}
        <Animated.View style={[styles.plate, {
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }]}>
          <View style={styles.plateInner} />
          <View style={styles.plateInner2} />

          {/* Fork — masuk dari kiri miring */}
          <Animated.Text style={[styles.utensil, {
            transform: [{ translateX: forkAnim }, { rotate: '-40deg' }],
          }]}>🍴</Animated.Text>

          {/* Knife — masuk dari kanan miring */}
          <Animated.Text style={[styles.utensil, {
            transform: [{ translateX: knifeAnim }, { rotate: '40deg' }],
          }]}>🔪</Animated.Text>
        </Animated.View>
      </View>

      {/* Label stage */}
      <Text style={styles.stageLabel}>MEMUAT PENGALAMAN</Text>
      <View style={styles.stageDots}>
        <View style={[styles.stageDot, { backgroundColor: '#FF6347' }]} />
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
      </View>
    </Animated.View>
  );
};

// ─── Stage 2: Brand Story — Typewriter cinematic ──────────────
const Stage2 = ({ onDone }) => {
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const lineOpacities = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const [line, setLine] = useState(0);

  const lines = [
    { text: 'FoodsStreets', style: styles.storyBrand },
    { text: 'by fhaz', style: styles.storyBy },
    { text: 'Street Food, Reimagined.', style: styles.storyTagline },
  ];

  useEffect(() => {
    // Fade in stage
    Animated.timing(screenOpacity, { toValue: 1, duration: 500, useNativeDriver: false }).start();

    // Tiap baris muncul dengan opacity + slide up
    lines.forEach((_, i) => {
      Animated.sequence([
        Animated.delay(400 + i * 1200),
        Animated.timing(lineOpacities[i], { toValue: 1, duration: 400, useNativeDriver: false }),
      ]).start();
    });

    // Fade out ke stage 3
    Animated.sequence([
      Animated.delay(4500),
      Animated.timing(screenOpacity, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start(() => onDone?.());
  }, []);

  return (
    <Animated.View style={[styles.stageContainer, { opacity: screenOpacity, backgroundColor: '#0f0f0f' }]}>
      {/* Garis horizontal dekoratif */}
      <View style={styles.storyLineTop} />
      <View style={styles.storyLineBottom} />

      {/* Brand lines */}
      <View style={styles.storyContent}>
        {lines.map((l, i) => (
          <Animated.View key={i} style={{
            opacity: lineOpacities[i],
            transform: [{
              translateY: lineOpacities[i].interpolate({
                inputRange: [0, 1], outputRange: [20, 0]
              })
            }]
          }}>
            {i < 2 ? (
              <Text style={l.style}>{l.text}</Text>
            ) : (
              <TypeLine
                text={l.text}
                style={l.style}
                delay={0}
                speed={50}
              />
            )}
          </Animated.View>
        ))}

        {/* Divider */}
        <Animated.View style={[styles.storyDivider, { opacity: lineOpacities[2] }]} />

        {/* Emoji icons */}
        <Animated.View style={[styles.storyIcons, { opacity: lineOpacities[2] }]}>
          {['🍔', '🛵', '⭐', '🎉'].map((e, i) => (
            <Text key={i} style={styles.storyEmoji}>{e}</Text>
          ))}
        </Animated.View>
      </View>

      {/* Stage indicator */}
      <Text style={styles.stageLabel}>MENYIAPKAN DUNIA</Text>
      <View style={styles.stageDots}>
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
        <View style={[styles.stageDot, { backgroundColor: '#FF6347' }]} />
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
      </View>
    </Animated.View>
  );
};

// ─── Stage 3: Loading Bar + Ready ─────────────────────────────
const Stage3 = ({ onDone }) => {
  const screenOpacity  = useRef(new Animated.Value(0)).current;
  const barWidth       = useRef(new Animated.Value(0)).current;
  const readyOpacity   = useRef(new Animated.Value(0)).current;
  const readyScale     = useRef(new Animated.Value(0.8)).current;
  const pulseAnim      = useRef(new Animated.Value(1)).current;
  const [percent, setPercent] = useState(0);
  const [status, setStatus]   = useState('Menginisialisasi...');

  const statusSteps = [
    { at: 0,   text: 'Menghubungkan ke server...' },
    { at: 25,  text: 'Memuat menu lezat...' },
    { at: 55,  text: 'Menyiapkan pengalaman terbaik...' },
    { at: 80,  text: 'Hampir siap...' },
    { at: 95,  text: 'Selesai! 🎉' },
  ];

  useEffect(() => {
    // Fade in
    Animated.timing(screenOpacity, { toValue: 1, duration: 400, useNativeDriver: false }).start();

    // Progress bar — interpolate ke percent counter
    barWidth.addListener(({ value }) => {
      const p = Math.round(value);
      setPercent(p);
      const step = [...statusSteps].reverse().find(s => p >= s.at);
      if (step) setStatus(step.text);
    });

    Animated.timing(barWidth, {
      toValue: 100,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // "Siap masuk" muncul saat bar 100%
    Animated.sequence([
      Animated.delay(2900),
      Animated.parallel([
        Animated.spring(readyScale, { toValue: 1, friction: 4, useNativeDriver: false }),
        Animated.timing(readyOpacity, { toValue: 1, duration: 400, useNativeDriver: false }),
      ]),
    ]).start();

    // Pulse loop pada ready badge
    Animated.sequence([
      Animated.delay(3000),
      Animated.loop(
        Animated.sequence([
          Animated.spring(pulseAnim, { toValue: 1.05, friction: 3, useNativeDriver: false }),
          Animated.spring(pulseAnim, { toValue: 1,    friction: 3, useNativeDriver: false }),
        ])
      ),
    ]).start();

    // Done — ke login
    Animated.sequence([
      Animated.delay(4200),
      Animated.timing(screenOpacity, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start(() => onDone?.());

    return () => barWidth.removeAllListeners();
  }, []);

  const barWidthInterpolated = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.stageContainer, { opacity: screenOpacity, backgroundColor: '#0a0a0a' }]}>

      {/* Logo kecil di atas */}
      <View style={styles.s3Logo}>
        <Text style={styles.s3LogoEmoji}>🍽️</Text>
        <Text style={styles.s3Brand}>FoodsStreets</Text>
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        {/* Percent counter */}
        <Text style={styles.percentText}>{percent}%</Text>

        {/* Bar container */}
        <View style={styles.barContainer}>
          {/* Track */}
          <View style={styles.barTrack} />

          {/* Fill dengan gradient-like shine */}
          <Animated.View style={[styles.barFill, { width: barWidthInterpolated }]}>
            {/* Shine effect di ujung bar */}
            <View style={styles.barShine} />
          </Animated.View>
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>{status}</Text>
      </View>

      {/* "Siap Masuk" badge */}
      <Animated.View style={[styles.readyBadge, {
        opacity: readyOpacity,
        transform: [{ scale: readyScale }, { scale: pulseAnim }],
      }]}>
        <Text style={styles.readyEmoji}>🚀</Text>
        <Text style={styles.readyText}>Siap Masuk!</Text>
      </Animated.View>

      {/* Stage indicator */}
      <Text style={styles.stageLabel}>SEBENTAR LAGI</Text>
      <View style={styles.stageDots}>
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
        <View style={[styles.stageDot, { backgroundColor: 'rgba(255,99,71,0.3)' }]} />
        <View style={[styles.stageDot, { backgroundColor: '#FF6347' }]} />
      </View>
    </Animated.View>
  );
};

// ─── Main SplashScreen ────────────────────────────────────────
const SplashScreen = ({ onFinish }) => {
  const [stage, setStage] = useState(1);

  return (
    <View style={styles.container}>
      {stage === 1 && <Stage1 onDone={() => setStage(2)} />}
      {stage === 2 && <Stage2 onDone={() => setStage(3)} />}
      {stage === 3 && <Stage3 onDone={onFinish} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0a0a0a' },
  stageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Stage 1 — Logo ──
  logoArea:       { justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  ring:           { position: 'absolute', borderWidth: 1.5, borderStyle: 'dashed' },
  glow:           { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,99,71,0.25)' },
  plate:          { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,99,71,0.2)', borderWidth: 2.5, borderColor: 'rgba(255,99,71,0.7)', justifyContent: 'center', alignItems: 'center' },
  plateInner:     { position: 'absolute', width: 74, height: 74, borderRadius: 37, borderWidth: 1.5, borderColor: 'rgba(255,99,71,0.4)' },
  plateInner2:    { position: 'absolute', width: 48, height: 48, borderRadius: 24, borderWidth: 1,   borderColor: 'rgba(255,99,71,0.25)' },
  utensil:        { position: 'absolute', fontSize: 28 },

  // ── Stage 2 — Story ──
  storyLineTop:    { position: 'absolute', top: height * 0.25, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,99,71,0.15)' },
  storyLineBottom: { position: 'absolute', bottom: height * 0.25, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,99,71,0.15)' },
  storyContent:    { alignItems: 'center', paddingHorizontal: 32, marginBottom: 60 },
  storyBrand:      { fontSize: 46, fontWeight: '900', color: '#FF6347', letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
  storyBy:         { fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: 6, textAlign: 'center', marginBottom: 24 },
  storyTagline:    { fontSize: 20, color: '#fff', fontWeight: '300', letterSpacing: 1, textAlign: 'center', fontStyle: 'italic' },
  storyDivider:    { width: 60, height: 2, backgroundColor: '#FF6347', marginTop: 28, marginBottom: 20, borderRadius: 1 },
  storyIcons:      { flexDirection: 'row', gap: 20 },
  storyEmoji:      { fontSize: 28 },

  // ── Stage 3 — Loading ──
  s3Logo:          { alignItems: 'center', marginBottom: 60 },
  s3LogoEmoji:     { fontSize: 52, marginBottom: 8 },
  s3Brand:         { fontSize: 28, fontWeight: '900', color: '#FF6347', letterSpacing: 1 },
  progressSection: { width: width * 0.8, alignItems: 'center', marginBottom: 40 },
  percentText:     { fontSize: 52, fontWeight: '900', color: '#fff', marginBottom: 16, letterSpacing: -2 },
  barContainer:    { width: '100%', height: 6, marginBottom: 16, position: 'relative' },
  barTrack:        { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  barFill:         { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#FF6347', borderRadius: 3, overflow: 'hidden' },
  barShine:        { position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, backgroundColor: 'rgba(255,255,255,0.4)' },
  statusText:      { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', letterSpacing: 0.5 },
  readyBadge:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,99,71,0.15)', borderWidth: 1, borderColor: 'rgba(255,99,71,0.4)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, marginBottom: 48 },
  readyEmoji:      { fontSize: 22 },
  readyText:       { fontSize: 18, fontWeight: '800', color: '#FF6347', letterSpacing: 1 },

  // ── Shared ──
  stageLabel:      { position: 'absolute', bottom: 60, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 4 },
  stageDots:       { position: 'absolute', bottom: 40, flexDirection: 'row', gap: 8 },
  stageDot:        { width: 6, height: 6, borderRadius: 3 },
});

export default SplashScreen;