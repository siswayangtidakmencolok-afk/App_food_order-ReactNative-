// src/screens/HomeScreen.js
// Map: Platform-aware — WebView Leaflet (mobile) / Static image (web)
// Install: npx expo install react-native-webview expo-location

import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Image, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import AnimatedLogo from '../components/AnimatedLogo';
import Aurora from '../components/Aurora';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ─── Typewriter text animation ────────────────────────────────
const TypewriterText = ({ text, style, delay = 0 }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0; let timer;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
        else { clearInterval(timer); setDone(true); }
      }, 80);
    }, delay);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [text, delay]);
  return (
    <Text style={style}>
      {displayed}
      {!done && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
};

// ─── CTA Card ─────────────────────────────────────────────────
const CTACard = ({ icon, title, subtitle, color, accentColor, dustColor, onPress, delay = 0 }) => {
  const translateX  = useRef(new Animated.Value(-width * 1.2)).current;
  const opacity     = useRef(new Animated.Value(0)).current;
  const pressScale  = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const scaleY      = useRef(new Animated.Value(0.85)).current;
  const PARTICLE_COUNT = 12;
  const particles = Array.from({ length: PARTICLE_COUNT });

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, friction: 8, tension: 60, useNativeDriver: false }),
        Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.spring(scaleY,     { toValue: 1, friction: 5, tension: 70, useNativeDriver: false }),
      ]),
    ]).start();
    Animated.sequence([
      Animated.delay(delay + 300),
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 200, useNativeDriver: false }),
      Animated.timing(glowOpacity, { toValue: 0,   duration: 400, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={styles.ctaWrap}>
      {particles.map((_, i) => (
        <DustParticle key={i} delay={delay + 100 + i * 30} color={dustColor || accentColor} />
      ))}
      <Animated.View style={{ opacity, transform: [{ translateX }, { scale: pressScale }, { scaleY }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.96, friction: 5, useNativeDriver: false }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1, friction: 3, useNativeDriver: false }).start()}
          activeOpacity={1}
          style={[styles.ctaCard, { backgroundColor: color }]}
        >
          <View style={[styles.ctaAccent, { backgroundColor: accentColor }]} />
          <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: glowOpacity, borderRadius: 20 }]} />
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

// ─── Dust Particle ────────────────────────────────────────────
const DustParticle = ({ delay, color }) => {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const targetX = (Math.random() - 0.5) * 120;
  const targetY = (Math.random() - 0.5) * 80;
  const size = Math.random() * 6 + 2;

  useEffect(() => {
    const startDelay = delay + Math.random() * 200;
    Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0.8, duration: 150, useNativeDriver: false }),
        Animated.spring(scale,   { toValue: 1,   friction: 4,   useNativeDriver: false }),
        Animated.timing(x,       { toValue: targetX, duration: 600, useNativeDriver: false }),
        Animated.timing(y,       { toValue: targetY, duration: 600, useNativeDriver: false }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: '10%', top: '50%',
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity,
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      pointerEvents: 'none', zIndex: 20,
    }} />
  );
};

// ─── Store Card ───────────────────────────────────────────────
const StoreCard = ({ store }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, friction: 5, useNativeDriver: false }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: false }).start()}
        activeOpacity={1} style={styles.storeCard}
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

// ─── Map Component — Platform Aware ───────────────────────────
// Mobile: WebView + Leaflet (OpenStreetMap, gratis)
// Web: Static image fallback (WebView tidak support web)
const MapView = ({ latitude, longitude, isDark, locationName }) => {

  // ── WEB FALLBACK ──
  if (Platform.OS === 'web') {
    // Pakai Static Maps dari geoapify (gratis 3000 req/hari, tanpa kartu kredit)
    const staticMapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=300&center=lonlat:${longitude},${latitude}&zoom=14&marker=lonlat:${longitude},${latitude};color:%23EE4D2D;size:medium&apiKey=YOUR_GEOAPIFY_KEY`;

    // Fallback paling aman untuk web: OpenStreetMap iframe embed
    const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

    return (
      <View style={styles.mapBox}>
        <iframe
          src={osmEmbedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 14,
          }}
          title="Peta Lokasi"
          sandbox="allow-scripts allow-same-origin"
        />
        <View style={[styles.mapPinLabel, { backgroundColor: '#EE4D2D' }]}>
          <Text style={styles.mapPinTxt}>🎯 {locationName || 'Lokasi Kamu'}</Text>
        </View>
      </View>
    );
  }

  // ── MOBILE: WebView + Leaflet ──
  const { WebView } = require('react-native-webview');

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:${isDark ? '#1a1a1a' : '#f0f0f0'}; }
        #map { width:100%; height:150px; }
        .leaflet-control-attribution, .leaflet-control-zoom { display:none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl:false, attributionControl:false,
          dragging:false, scrollWheelZoom:false,
          doubleClickZoom:false, touchZoom:false
        }).setView([${latitude}, ${longitude}], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

        var pulse = L.divIcon({
          html:'<div style="width:40px;height:40px;border-radius:50%;background:rgba(238,77,45,0.2);border:2px solid rgba(238,77,45,0.5);animation:p 1.5s infinite;"></div><style>@keyframes p{0%{transform:scale(0.8);opacity:1}100%{transform:scale(1.5);opacity:0}}</style>',
          iconSize:[40,40], iconAnchor:[20,20], className:''
        });
        var dot = L.divIcon({
          html:'<div style="background:#EE4D2D;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
          iconSize:[14,14], iconAnchor:[7,7], className:''
        });

        L.marker([${latitude}, ${longitude}], { icon: pulse }).addTo(map);
        L.marker([${latitude}, ${longitude}], { icon: dot }).addTo(map)
          .bindPopup('<b>📍 Lokasi Kamu</b>', { closeButton:false }).openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.mapBox}>
      <WebView
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.mapLoading}>
            <Text style={{ color: '#999', fontSize: 12 }}>🗺️ Memuat peta...</Text>
          </View>
        )}
      />
    </View>
  );
};

// ─── Data Toko ────────────────────────────────────────────────
const nearbyStores = [
  { id: '1', name: 'Warteg Bahari',     distance: '0.5 km', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
  { id: '2', name: 'Sate Khas Senayan', distance: '1.2 km', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80' },
  { id: '3', name: 'Ayam Geprek Bensu', distance: '2.0 km', rating: 4.2, image: 'https://images.unsplash.com/photo-1626804475297-41609ea0ebb3?w=500&q=80' },
  { id: '4', name: 'Nasi Goreng Gila',  distance: '2.5 km', rating: 4.6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80' },
];

// ─── Main Screen ──────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { isDarkMode, userProfile, cart, menuItems } = useApp();
  const theme   = isDarkMode ? darkTheme : lightTheme;
  const bg      = isDarkMode ? '#0a0a0a' : '#f5f5f5';
  const card    = isDarkMode ? '#161616' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';

  const headerAnim = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation]   = useState({ latitude: -6.2088, longitude: 106.8456 });
  const [locationName, setLocationName]   = useState('Mendeteksi lokasi...');
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();

    // Lokasi hanya di mobile, web pakai default Jakarta
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            setLocationGranted(true);
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            if (geo.length > 0) {
              const g = geo[0];
              setLocationName(g.district || g.subregion || g.city || 'Lokasi Kamu');
            }
          } else {
            setLocationName('Jakarta (default)');
          }
        } catch {
          setLocationName('Jakarta (default)');
        }
      })();
    } else {
      // Web: langsung pakai Jakarta default
      setLocationName('Jakarta, Indonesia');
      setLocationGranted(true);
    }
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>

      {/* ══ HERO ══ */}
      <View style={styles.hero}>
        <View style={styles.heroBg} />
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroCircle3} />
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Aurora colorStops={['#FF8C00', '#FF6347', '#FF2200']} amplitude={1.4} blend={0.7} speed={0.6} />
        </View>
        <View style={styles.heroOverlay} />

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

      {/* ══ CTA ══ */}
      <View style={styles.ctaSection}>
        <Text style={[styles.ctaSectionTitle, { color: textCol }]}>Mau ngapain hari ini?</Text>
        <CTACard icon="🍔" title="Jelajahi Menu"
          subtitle={`${menuItems?.length || 0} pilihan makanan & minuman`}
          color="#FF6347" accentColor="#e0432a" dustColor="#FFB347"
          onPress={() => navigation.navigate('Menu')} delay={300} />
        <CTACard icon="🛒" title="Keranjang Saya"
          subtitle={cart.length > 0 ? `${cart.length} item menunggu checkout` : 'Belum ada item — yuk tambah!'}
          color="#1a1a2e" accentColor="#FF6347" dustColor="#FF6347"
          onPress={() => navigation.navigate('Cart')} delay={550} />
        <CTACard icon="📋" title="Riwayat Pesanan"
          subtitle="Cek status & pesan ulang favoritmu"
          color="#0f3460" accentColor="#4CAF50" dustColor="#4CAF50"
          onPress={() => navigation.navigate('History')} delay={800} />
      </View>

      {/* ══ TOKO DI SEKITAR ══ */}
      <View style={[styles.section, { backgroundColor: card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>📍 Toko di Sekitar</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>Live</Text>
          </View>
        </View>

        {/* Lokasi bar */}
        <View style={[styles.locationBar, { backgroundColor: isDarkMode ? '#252525' : '#fff5f3' }]}>
          <Text style={{ fontSize: 14 }}>📍</Text>
          <Text style={[styles.locationTxt, { color: isDarkMode ? '#ccc' : '#555' }]} numberOfLines={1}>
            {locationName}
          </Text>
          <View style={[styles.locationDot, { backgroundColor: locationGranted ? '#4CAF50' : '#FF6347' }]} />
        </View>

        {/* Map — platform aware */}
        <MapView
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          isDark={isDarkMode}
          locationName={locationName}
        />

        {/* Store cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeScroll}>
          {nearbyStores.map(store => <StoreCard key={store.id} store={store} />)}
        </ScrollView>
      </View>

      {/* ══ PROMO BANNER ══ */}
      <View style={styles.promoBanner}>
        <View style={styles.promoBg} />
        <Text style={styles.promoEmoji}>🎉</Text>
        <View>
          <Text style={styles.promoTitle}>Gratis Ongkir!</Text>
          <Text style={styles.promoSub}>Untuk semua pesanan hari ini</Text>
        </View>
        <TouchableOpacity style={styles.promoBtn} onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.promoBtnTxt}>Pesan →</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },

  // Hero
  hero:             { paddingBottom: 24, alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: 380 },
  heroBg:           { ...StyleSheet.absoluteFillObject, backgroundColor: '#FF6347' },
  heroOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 2 },
  heroCircle1:      { position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroCircle2:      { position: 'absolute', bottom: -40, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.08)' },
  heroCircle3:      { position: 'absolute', top: 40, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  brandRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  brandName:        { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  cursor:           { color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  tagline:          { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: 0.5 },
  greetBox:         { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  greetTxt:         { color: '#fff', fontSize: 15, fontWeight: '600' },
  quickStats:       { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, gap: 20 },
  quickStat:        { alignItems: 'center', flex: 1 },
  quickStatVal:     { fontSize: 22, fontWeight: '900', color: '#fff' },
  quickStatLbl:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  quickStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' },

  // CTA
  ctaSection:       { padding: 16, paddingTop: 20 },
  ctaSectionTitle:  { fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: 0.3 },
  ctaWrap:          { marginBottom: 12 },
  ctaCard:          { borderRadius: 20, overflow: 'hidden', position: 'relative' },
  ctaAccent:        { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, opacity: 0.3 },
  ctaContent:       { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  ctaIcon:          { fontSize: 36 },
  ctaTitle:         { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3 },
  ctaSub:           { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  ctaArrow:         { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  ctaArrowTxt:      { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Section
  section:          { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:     { fontSize: 16, fontWeight: '800' },
  liveBadge:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff444420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  liveDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff4444' },
  liveTxt:          { fontSize: 11, fontWeight: '700', color: '#ff4444' },

  // Location
  locationBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 10, gap: 8 },
  locationTxt:      { flex: 1, fontSize: 12, fontWeight: '500' },
  locationDot:      { width: 8, height: 8, borderRadius: 4 },

  // Map
  mapBox:           { width: '100%', height: 150, borderRadius: 14, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  mapLoading:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  mapPinLabel:      { position: 'absolute', bottom: 8, left: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  mapPinTxt:        { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Store scroll
  storeScroll:      { marginHorizontal: -4 },
  storeCard:        { width: 150, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  storeImg:         { width: '100%', height: 100, resizeMode: 'cover' },
  storeOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  storeInfo:        { padding: 10 },
  storeName:        { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 6 },
  storeMeta:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeDist:        { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  storeRatingBadge: { backgroundColor: 'rgba(255,99,71,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  storeRating:      { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  // Promo Banner
  promoBanner:      { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden', position: 'relative' },
  promoBg:          { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a1a2e' },
  promoEmoji:       { fontSize: 32 },
  promoTitle:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  promoSub:         { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  promoBtn:         { marginLeft: 'auto', backgroundColor: '#FF6347', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  promoBtnTxt:      { color: '#fff', fontWeight: '800', fontSize: 13 },
});

export default HomeScreen;