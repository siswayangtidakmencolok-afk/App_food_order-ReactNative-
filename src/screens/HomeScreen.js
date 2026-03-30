// src/screens/HomeScreen.js
// Map: OpenStreetMap + Leaflet via WebView — 100% GRATIS, tanpa API key
// Install dulu: npx expo install react-native-webview expo-location

import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { WebView } from 'react-native-webview';
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
    let i = 0;
    let timer;
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
      <Animated.View style={{ opacity, transform: [{ translateX }, { scale: pressScale }, { scaleY }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.96, friction: 5, useNativeDriver: false }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1,    friction: 3, useNativeDriver: false }).start()}
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

// ─── Store Card ───────────────────────────────────────────────
const StoreCard = ({ store }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, friction: 5, useNativeDriver: false }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1,    friction: 3, useNativeDriver: false }).start()}
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

// ─── OpenStreetMap Component (Gratis, tanpa API key) ──────────
const OpenStreetMapView = ({ latitude, longitude, isDark }) => {
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${isDark ? '#1a1a1a' : '#f0f0f0'}; }
        #map { width: 100%; height: 150px; border-radius: 12px; }
        .leaflet-control-attribution { display: none; }
        .leaflet-control-zoom { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        }).setView([${latitude}, ${longitude}], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Custom marker merah
        var redIcon = L.divIcon({
          html: '<div style="background:#EE4D2D;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: ''
        });

        // Pulse ring
        var pulseIcon = L.divIcon({
          html: '<div style="width:40px;height:40px;border-radius:50%;background:rgba(238,77,45,0.2);border:2px solid rgba(238,77,45,0.5);animation:pulse 1.5s infinite;position:relative;top:-12px;left:-12px;"></div><style>@keyframes pulse{0%{transform:scale(0.8);opacity:1}100%{transform:scale(1.4);opacity:0}}</style>',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: ''
        });

        L.marker([${latitude}, ${longitude}], { icon: pulseIcon }).addTo(map);
        L.marker([${latitude}, ${longitude}], { icon: redIcon })
          .addTo(map)
          .bindPopup('<b>📍 Lokasi Kamu</b>', { closeButton: false })
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: mapHTML }}
      style={styles.mapWebView}
      scrollEnabled={false}
      bounces={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.mapLoading}>
          <Text style={{ color: '#999', fontSize: 12 }}>🗺️ Memuat peta...</Text>
        </View>
      )}
    />
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

  // ── State lokasi ──
  const [userLocation, setUserLocation] = useState({ latitude: -6.2088, longitude: 106.8456 }); // Default Jakarta
  const [locationName, setLocationName] = useState('Mendeteksi lokasi...');
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();

    // Request lokasi
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

        // Reverse geocode untuk nama lokasi
        const geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (geo.length > 0) {
          const g = geo[0];
          setLocationName(`${g.district || g.subregion || g.city || 'Lokasi Kamu'}`);
        }
      } else {
        setLocationName('Izin lokasi ditolak');
      }
    })();
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

      {/* ══ CTA BUTTONS ══ */}
      <View style={styles.ctaSection}>
        <Text style={[styles.ctaSectionTitle, { color: textCol }]}>Mau ngapain hari ini?</Text>
        <CTACard icon="🍔" title="Jelajahi Menu" subtitle={`${menuItems?.length || 0} pilihan makanan & minuman`}
          color="#FF6347" accentColor="#e0432a" dustColor="#FFB347"
          onPress={() => navigation.navigate('Menu')} delay={300} />
        <CTACard icon="🛒" title="Keranjang Saya"
          subtitle={cart.length > 0 ? `${cart.length} item menunggu checkout` : 'Belum ada item — yuk tambah!'}
          color="#1a1a2e" accentColor="#FF6347" dustColor="#FF6347"
          onPress={() => navigation.navigate('Cart')} delay={550} />
        <CTACard icon="📋" title="Riwayat Pesanan" subtitle="Cek status & pesan ulang favoritmu"
          color="#0f3460" accentColor="#4CAF50" dustColor="#4CAF50"
          onPress={() => navigation.navigate('History')} delay={800} />
      </View>

      {/* ══ TOKO DI SEKITAR — REAL MAP ══ */}
      <View style={[styles.section, { backgroundColor: card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>📍 Toko di Sekitar</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>Live</Text>
          </View>
        </View>

        {/* ── Lokasi info bar ── */}
        <View style={[styles.locationBar, { backgroundColor: isDarkMode ? '#252525' : '#fff5f3' }]}>
          <Text style={{ fontSize: 14 }}>📍</Text>
          <Text style={[styles.locationTxt, { color: isDarkMode ? '#ccc' : '#555' }]} numberOfLines={1}>
            {locationGranted ? locationName : '📡 Meminta izin lokasi...'}
          </Text>
          {locationGranted && (
            <View style={styles.locationDot} />
          )}
        </View>

        {/* ── REAL OpenStreetMap ── */}
        <View style={styles.mapBox}>
          <OpenStreetMapView
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            isDark={isDarkMode}
          />
        </View>

        {/* Store cards horizontal scroll */}
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
  container: { flex: 1 },

  // ── Hero ──
  hero:            { paddingBottom: 24, alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: 380 },
  heroBg:          { ...StyleSheet.absoluteFillObject, backgroundColor: '#FF6347' },
  heroOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', zIndex: 2 },
  heroCircle1:     { position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroCircle2:     { position: 'absolute', bottom: -40, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.08)' },
  heroCircle3:     { position: 'absolute', top: 40, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)' },
  brandRow:        { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  brandName:       { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  cursor:          { color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  tagline:         { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: 0.5 },
  greetBox:        { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  greetTxt:        { color: '#fff', fontSize: 15, fontWeight: '600' },
  quickStats:      { flexDirection: 'row', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24, gap: 20 },
  quickStat:       { alignItems: 'center', flex: 1 },
  quickStatVal:    { fontSize: 22, fontWeight: '900', color: '#fff' },
  quickStatLbl:    { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  quickStatDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch' },

  // ── CTA ──
  ctaSection:      { padding: 16, paddingTop: 20 },
  ctaSectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: 0.3 },
  ctaWrap:         { marginBottom: 12 },
  ctaCard:         { borderRadius: 20, overflow: 'hidden', position: 'relative' },
  ctaAccent:       { position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, opacity: 0.3 },
  ctaContent:      { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  ctaIcon:         { fontSize: 36 },
  ctaTitle:        { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3 },
  ctaSub:          { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  ctaArrow:        { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  ctaArrowTxt:     { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // ── Section ──
  section:         { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:    { fontSize: 16, fontWeight: '800' },
  liveBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff444420', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 5 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff4444' },
  liveTxt:         { fontSize: 11, fontWeight: '700', color: '#ff4444' },

  // ── Location bar ──
  locationBar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 10, gap: 8 },
  locationTxt:     { flex: 1, fontSize: 12, fontWeight: '500' },
  locationDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },

  // ── Map ──
  mapBox:          { width: '100%', height: 150, borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  mapWebView:      { flex: 1, borderRadius: 14 },
  mapLoading:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },

  // ── Store scroll ──
  storeScroll:     { marginHorizontal: -4 },
  storeCard:       { width: 150, marginRight: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  storeImg:        { width: '100%', height: 100, resizeMode: 'cover' },
  storeOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  storeInfo:       { padding: 10 },
  storeName:       { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 6 },
  storeMeta:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeDist:       { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  storeRatingBadge:{ backgroundColor: 'rgba(255,99,71,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  storeRating:     { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  // ── Promo Banner ──
  promoBanner:     { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden', position: 'relative' },
  promoBg:         { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a1a2e' },
  promoEmoji:      { fontSize: 32 },
  promoTitle:      { fontSize: 16, fontWeight: '900', color: '#fff' },
  promoSub:        { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  promoBtn:        { marginLeft: 'auto', backgroundColor: '#FF6347', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  promoBtnTxt:     { color: '#fff', fontWeight: '800', fontSize: 13 },
});

export default HomeScreen;