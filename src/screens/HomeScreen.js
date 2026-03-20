// src/screens/HomeScreen.js
// Design: Dark street food aesthetic — urban, bold, energetic
// Logo animasi muncul + brand name FoodsStreets dengan typewriter effect
// CTA cards kreatif dengan hover press animation

import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import AnimatedLogo from '../components/AnimatedLogo';
import Aurora from '../components/Aurora';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ─── Logo SVG sebagai komponen (pakai emoji + shapes) ─────────
// Karena React Native tidak bisa render SVG langsung,
// kita pakai Image dari file yang diupload user
// ATAU render logo kreatif dengan View + Text

const LogoMark = ({ size = 80 }) => {
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale masuk saat pertama muncul
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      delay: 200,
      useNativeDriver: false,
    }).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }],
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Glow ring */}
      <Animated.View style={[styles.logoGlow, { opacity: glowOpacity, width: size + 30, height: size + 30, borderRadius: (size + 30) / 2 }]} />

      {/* Logo circle */}
      <View style={[styles.logoCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Inner circle */}
        <View style={[styles.logoInnerCircle, { width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375 }]} />
        {/* Fork & knife emoji sebagai placeholder — user bisa ganti dengan Image */}
        <Text style={{ fontSize: size * 0.38, position: 'absolute' }}>🍴</Text>
      </View>
    </Animated.View>
  );
};

// ─── Typewriter text animation ────────────────────────────────
const TypewriterText = ({ text, style, delay = 0 }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);

  useEffect(() => {
    let i    = 0;
    let timer;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setDone(true);
        }
      }, 80);
    }, delay);

    return () => { clearTimeout(start); clearInterval(timer); };
  }, [text, delay]);

  return (
    <Text style={style}>
      {displayed}
      {/* Cursor blink */}
      {!done && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
};

// ─── CTA Card (Menu & Cart) ────────────────────────────────────
// ─── CTA Card — slide masuk dari kiri ke kanan ───────────────
// ─── CTA Card — Cinematic dust dari kiri ke kanan ─────────────
const CTACard = ({ icon, title, subtitle, color, accentColor, dustColor, onPress, delay = 0 }) => {
  const translateX   = useRef(new Animated.Value(-width * 1.2)).current;
  const opacity      = useRef(new Animated.Value(0)).current;
  const pressScale   = useRef(new Animated.Value(1)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const scaleY       = useRef(new Animated.Value(0.85)).current;

  // Partikel debu — 12 partikel per card
  const PARTICLE_COUNT = 12;
  const particles = Array.from({ length: PARTICLE_COUNT });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Slide dari kiri dengan spring — berasa berat lalu settle
        Animated.spring(translateX, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: false,
        }),
        // Fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        // Scale Y — seperti melar dari gepeng jadi penuh
        Animated.spring(scaleY, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Glow flash saat card settle
    Animated.sequence([
      Animated.delay(delay + 300),
      Animated.timing(glowOpacity, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.96,
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.ctaWrap}>
      {/* ── Partikel debu — render di luar card ── */}
      {particles.map((_, i) => (
        <DustParticle
          key={i}
          delay={delay + 100 + i * 30}
          color={dustColor || accentColor}
        />
      ))}

      {/* ── Card utama ── */}
      <Animated.View style={{
        opacity,
        transform: [
          { translateX },
          { scale: pressScale },
          { scaleY },
        ],
      }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[styles.ctaCard, { backgroundColor: color }]}
        >
          {/* Accent circle pojok */}
          <View style={[styles.ctaAccent, { backgroundColor: accentColor }]} />

          {/* Glow flash overlay saat settle */}
          <Animated.View style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: '#fff',
              opacity: glowOpacity,
              borderRadius: 20,
            }
          ]} />

          {/* Konten */}
          <View style={styles.ctaContent}>
            <Text style={styles.ctaIcon}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>{title}</Text>
              <Text style={styles.ctaSub}>{subtitle}</Text>
            </View>
            <View style={[styles.ctaArrow, { backgroundColor: accentColor }]}>
              <Text style={styles.ctaArrowTxt}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ─── Store Card ────────────────────────────────────────────────
const StoreCard = ({ store }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.96, friction: 5, useNativeDriver: false }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    friction: 3, useNativeDriver: false }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.storeCard}
      >
        <Image source={{ uri: store.image }} style={styles.storeImg} />
        <View style={styles.storeOverlay} />
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
          <View style={styles.storeMeta}>
            <Text style={styles.storeDist}>📍 {store.distance}</Text>
            <View style={styles.storeRatingBadge}>
              <Text style={styles.storeRating}>⭐ {store.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Dust Particle ────────────────────────────────────────────
// Satu partikel debu kecil yang terbang saat card masuk
const DustParticle = ({ delay, color }) => {
  const x       = useRef(new Animated.Value(0)).current;
  const y       = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0)).current;

  // Posisi random untuk tiap partikel
  const targetX = (Math.random() - 0.5) * 120;
  const targetY = (Math.random() - 0.5) * 80;
  const size    = Math.random() * 6 + 2;

  useEffect(() => {
    const startDelay = delay + Math.random() * 200;

    Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        // Muncul
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: false,
        }),
        // Terbang ke posisi random
        Animated.timing(x, {
          toValue: targetX,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(y, {
          toValue: targetY,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
      // Menghilang
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      left: '10%',
      top: '50%',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity,
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      pointerEvents: 'none',
      zIndex: 20,
    }} />
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const nearbyStores = [
  { id: '1', name: 'Warteg Bahari',    distance: '0.5 km', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
  { id: '2', name: 'Sate Khas Senayan',distance: '1.2 km', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80' },
  { id: '3', name: 'Ayam Geprek Bensu',distance: '2.0 km', rating: 4.2, image: 'https://images.unsplash.com/photo-1626804475297-41609ea0ebb3?w=500&q=80' },
  { id: '4', name: 'Nasi Goreng Gila', distance: '2.5 km', rating: 4.6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80' },
];

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, userProfile, cart, menuItems } = useApp();
  const theme   = isDarkMode ? darkTheme : lightTheme;
  const bg      = isDarkMode ? '#0a0a0a' : '#f5f5f5';
  const card    = isDarkMode ? '#161616' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const subText = isDarkMode ? '#666666' : '#999999';

  // Animasi header fade in
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════════════════════════
          HERO HEADER
          ════════════════════════════════════════ */}

{/* ══════════════════════════════════════
    HERO
    ══════════════════════════════════════ */}
<View style={styles.hero}>

  {/* 1. Background oranye base — paling bawah */}
  <View style={styles.heroBg} />

  {/* 2. Decorative circles — di atas base */}
  <View style={styles.heroCircle1} />
  <View style={styles.heroCircle2} />
  <View style={styles.heroCircle3} />

  {/* 3. Aurora — di atas circles, zIndex tinggi */}
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <Aurora
      colorStops={['#FF8C00', '#FF6347', '#FF2200']}
      amplitude={1.4}
      blend={0.7}
      speed={0.6}
    />
  </View>

  {/* 4. Dark overlay tipis biar teks tetap terbaca */}
  <View style={styles.heroOverlay} />

  {/* 5. Konten teks di paling atas */}
  <Animated.View style={{ opacity: headerAnim, alignItems: 'center', paddingTop: 20, width: '100%', zIndex: 10 }}>
    <AnimatedLogo size={90} />
    <View style={styles.brandRow}>
      <TypewriterText text="FoodsStreets" style={styles.brandName} delay={800} />
    </View>
    <Text style={styles.tagline}>by fhaz • Street Food Experience</Text>
    <View style={styles.greetBox}>
      <Text style={styles.greetTxt}>
        {greeting()}, {userProfile?.name?.split(' ')[0] || 'Sobat'} 👋
      </Text>
    </View>
    <View style={styles.quickStats}>
      <View style={styles.quickStat}>
        <Text style={styles.quickStatVal}>{menuItems?.length || 0}</Text>
        <Text style={styles.quickStatLbl}>Menu</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStat}>
        <Text style={styles.quickStatVal}>{cart.length}</Text>
        <Text style={styles.quickStatLbl}>Keranjang</Text>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStat}>
        <Text style={styles.quickStatVal}>4</Text>
        <Text style={styles.quickStatLbl}>Toko Dekat</Text>
      </View>
    </View>
  </Animated.View>
</View>

      {/* ════════════════════════════════════════
          CTA BUTTONS — Menu & Keranjang
          ════════════════════════════════════════ */}
      <View style={styles.ctaSection}>
        <Text style={[styles.ctaSectionTitle, { color: textCol }]}>
          Mau ngapain hari ini?
        </Text>

        {/* Lihat Menu */}
        <CTACard
  icon="🍔"
  title="Jelajahi Menu"
  subtitle={`${menuItems?.length || 0} pilihan makanan & minuman`}
  color="#FF6347"
  accentColor="#e0432a"
  dustColor="#FFB347"
  onPress={() => navigation.navigate('Menu')}
  delay={300}
/>

{/* Lihat Keranjang */}
<CTACard
  icon="🛒"
  title="Keranjang Saya"
  subtitle={cart.length > 0 ? `${cart.length} item menunggu checkout` : 'Belum ada item — yuk tambah!'}
  color="#1a1a2e"
  accentColor="#FF6347"
  dustColor="#FF6347"
  onPress={() => navigation.navigate('Cart')}
  delay={550}
/>

{/* Riwayat Pesanan */}
<CTACard
  icon="📋"
  title="Riwayat Pesanan"
  subtitle="Cek status & pesan ulang favoritmu"
  color="#0f3460"
  accentColor="#4CAF50"
  dustColor="#4CAF50"
  onPress={() => navigation.navigate('History')}
  delay={800}
/>
      </View>

      {/* ════════════════════════════════════════
          TOKO DI SEKITAR
          ════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            📍 Toko di Sekitar
          </Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>Live</Text>
          </View>
        </View>

        {/* Fake map */}
        <View style={styles.mapBox}>
          <Image
            source={{ uri: 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg' }}
            style={styles.mapImg}
          />
          <View style={styles.mapOverlay} />
          <View style={styles.mapPin}>
            <Text style={styles.mapPinTxt}>🎯 Lokasi Kamu</Text>
          </View>
          {/* Animated pulse di map */}
          <View style={styles.mapPulse} />
        </View>

        {/* Store cards horizontal scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeScroll}>
          {nearbyStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </ScrollView>
      </View>

      {/* ════════════════════════════════════════
          PROMO BANNER
          ════════════════════════════════════════ */}
      <View style={styles.promoBanner}>
        <View style={styles.promoBg} />
        <Text style={styles.promoEmoji}>🎉</Text>
        <View>
          <Text style={styles.promoTitle}>Gratis Ongkir!</Text>
          <Text style={styles.promoSub}>Untuk semua pesanan hari ini</Text>
        </View>
        <TouchableOpacity
          style={styles.promoBtn}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.promoBtnTxt}>Pesan →</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:          { flex: 1 },

  // ── Hero ──
  hero:               { paddingBottom: 24, alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: 380 },
  heroBg:             { ...StyleSheet.absoluteFillObject, backgroundColor: '#FF6347' },
  heroOverlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 2, },
  heroCircle1:        { position: 'absolute', top: -80, right: -80,  width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroCircle2:        { position: 'absolute', bottom: -40, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.08)' },
  heroCircle3:        { position: 'absolute', top: 40,  left: -30,   width: 120, height: 120, borderRadius: 60,  backgroundColor: 'rgba(255,255,255,0.04)' },

  // Logo
  logoGlow:           { position: 'absolute', backgroundColor: 'rgba(255,200,150,0.3)' },
  logoCircle:         { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  logoInnerCircle:    { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },

  // Brand
  brandRow:           { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  brandName:          { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  cursor:             { color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  tagline:            { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: 0.5 },

  // Greeting
  greetBox:           { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  greetTxt:           { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Quick stats
  quickStats:         { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, gap: 20 },
  quickStat:          { alignItems: 'center', flex: 1 },
  quickStatVal:       { fontSize: 22, fontWeight: '900', color: '#fff' },
  quickStatLbl:       { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  quickStatDivider:   { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' },

  // ── CTA Section ──
  ctaSection:         { padding: 16, paddingTop: 20 },
  ctaSectionTitle:    { fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: 0.3 },

  ctaWrap:            { marginBottom: 12 },
  ctaCard:            { borderRadius: 20, overflow: 'hidden', position: 'relative' },
  ctaShimmer:         { position: 'absolute', top: 0, bottom: 0, width: 60, backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ skewX: '-20deg' }] },
  ctaAccent:          { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, opacity: 0.3 },
  ctaContent:         { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  ctaIcon:            { fontSize: 36 },
  ctaTitle:           { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3 },
  ctaSub:             { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  ctaArrow:           { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  ctaArrowTxt:        { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // ── Section ──
  section:            { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:       { fontSize: 16, fontWeight: '800' },

  // Live badge
  liveBadge:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff444420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  liveDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff4444' },
  liveTxt:            { fontSize: 11, fontWeight: '700', color: '#ff4444' },

  // Map
  mapBox:             { width: '100%', height: 150, borderRadius: 14, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  mapImg:             { width: '100%', height: '100%', resizeMode: 'cover' },
  mapOverlay:         { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  mapPin:             { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -60 }, { translateY: -16 }], backgroundColor: '#FF6347', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapPinTxt:          { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  mapPulse:           { position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,99,71,0.4)', transform: [{ translateX: -10 }, { translateY: 10 }] },

  // Store scroll
  storeScroll:        { marginHorizontal: -4 },
  storeCard:          { width: 150, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  storeImg:           { width: '100%', height: 100, resizeMode: 'cover' },
  storeOverlay:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  storeInfo:          { padding: 10 },
  storeName:          { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 6 },
  storeMeta:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeDist:          { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  storeRatingBadge:   { backgroundColor: 'rgba(255,99,71,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  storeRating:        { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  // ── Promo Banner ──
  promoBanner:        { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden', position: 'relative' },
  promoBg:            { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a1a2e' },
  promoEmoji:         { fontSize: 32 },
  promoTitle:         { fontSize: 16, fontWeight: '900', color: '#fff' },
  promoSub:           { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  promoBtn:           { marginLeft: 'auto', backgroundColor: '#FF6347', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  promoBtnTxt:        { color: '#fff', fontWeight: '800', fontSize: 13 },
});

export default HomeScreen;