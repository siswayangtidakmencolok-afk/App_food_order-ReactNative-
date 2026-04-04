// src/screens/HomeScreen.js
// Map: Platform-aware — WebView Leaflet (mobile) / Static image (web)
// Install: npx expo install react-native-webview expo-location expo-web-browser expo-linear-gradient

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert,
  Animated, Dimensions, Image, Platform, ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity, View
} from 'react-native';
import AnimatedLogo from '../components/AnimatedLogo';
import Aurora from '../components/Aurora';
import MapComponent from '../components/MapComponent';
import { GEOAPIFY_KEY } from '../config/maps';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';
import { fetchAITrends } from '../services/qdrantService';

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

// ─── Cinematic Sparkle Particle ───────────────────────────────
const SparkleParticle = ({ delay, color, startX = 0 }) => {
  const x = useRef(new Animated.Value(startX)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  const targetX = startX + (Math.random() * 200 + 100);
  const targetY = (Math.random() - 0.5) * 150;
  const size = Math.random() * 8 + 4;
  const duration = Math.random() * 400 + 600;

  useEffect(() => {
    const startDelay = delay + Math.random() * 150;
    Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(opacity, { toValue: 0.8, duration: duration - 100, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.spring(scale, { toValue: 1.2, friction: 3, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(x, { toValue: targetX, duration: duration, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(y, { toValue: targetY, duration: duration, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(rotate, { toValue: 360, duration: duration, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={{
      position: 'absolute', left: 0, top: '50%',
      width: size, height: size, opacity,
      transform: [{ translateX: x }, { translateY: y }, { scale }, { rotate: spin }],
      pointerEvents: 'none', zIndex: 25,
    }}>
      <View style={{
        width: '100%', height: '100%',
        backgroundColor: color,
        borderRadius: size / 2,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 5,
      }} />
    </Animated.View>
  );
};

// ─── Trail Particle (follows card movement) ───────────────────
const TrailParticle = ({ delay, color, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const translateX = useRef(new Animated.Value(-width + index * 30)).current;
  const size = Math.random() * 6 + 3;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay + index * 20),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0.6, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(translateX, { toValue: -50 + index * 25, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: '5%', top: 20 + (index % 3) * 20,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity,
      transform: [{ translateX }, { scale }],
      pointerEvents: 'none', zIndex: 15,
    }} />
  );
};

// ─── CTA Card dengan Animasi Cinematic ────────────────────────
const CTACard = ({ icon, title, subtitle, color, accentColor, dustColor, onPress, delay = 0 }) => {
  const translateX  = useRef(new Animated.Value(-width * 1.5)).current;
  const opacity     = useRef(new Animated.Value(0)).current;
  const pressScale  = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const scaleY      = useRef(new Animated.Value(0.7)).current;
  const scaleX      = useRef(new Animated.Value(0.9)).current;
  const shimmerX    = useRef(new Animated.Value(-200)).current;
  const borderGlow  = useRef(new Animated.Value(0)).current;
  
  // Lebih banyak partikel untuk efek cinematic
  const DUST_COUNT = 18;
  const SPARKLE_COUNT = 12;
  const TRAIL_COUNT = 8;
  const dustParticles = Array.from({ length: DUST_COUNT });
  const sparkleParticles = Array.from({ length: SPARKLE_COUNT });
  const trailParticles = Array.from({ length: TRAIL_COUNT });

  useEffect(() => {
    // Animasi masuk yang lebih dramatis
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Slide dari kiri dengan spring yang lebih bouncy
        Animated.spring(translateX, { 
          toValue: 0, 
          friction: 6, 
          tension: 40, 
          useNativeDriver: Platform.OS !== 'web' 
        }),
        // Fade in
        Animated.timing(opacity, { 
          toValue: 1, 
          duration: 400, 
          useNativeDriver: Platform.OS !== 'web' 
        }),
        // Scale Y untuk efek "unfold"
        Animated.spring(scaleY, { 
          toValue: 1, 
          friction: 4, 
          tension: 50, 
          useNativeDriver: Platform.OS !== 'web' 
        }),
        // Scale X untuk depth
        Animated.spring(scaleX, { 
          toValue: 1, 
          friction: 5, 
          tension: 60, 
          useNativeDriver: Platform.OS !== 'web' 
        }),
      ]),
    ]).start();

    // Efek glow burst saat muncul
    Animated.sequence([
      Animated.delay(delay + 200),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0.6, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(borderGlow, { toValue: 1, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(borderGlow, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    ]).start();

    // Shimmer effect
    Animated.sequence([
      Animated.delay(delay + 400),
      Animated.timing(shimmerX, { toValue: width + 100, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const borderColor = borderGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', accentColor]
  });

  return (
    <View style={styles.ctaWrap}>
      {/* Trail particles - mengikuti pergerakan card */}
      {trailParticles.map((_, i) => (
        <TrailParticle key={`trail-${i}`} delay={delay} color={dustColor || accentColor} index={i} />
      ))}
      
      {/* Dust particles - burst effect */}
      {dustParticles.map((_, i) => (
        <DustParticle key={`dust-${i}`} delay={delay + 50 + i * 25} color={dustColor || accentColor} />
      ))}
      
      {/* Sparkle particles - cinematic glow */}
      {sparkleParticles.map((_, i) => (
        <SparkleParticle 
          key={`sparkle-${i}`} 
          delay={delay + 150 + i * 40} 
          color={i % 2 === 0 ? '#FFD700' : (dustColor || accentColor)} 
          startX={-width * 0.3}
        />
      ))}
      
      <Animated.View style={{ 
        opacity, 
        transform: [
          { translateX }, 
          { scale: pressScale }, 
          { scaleY },
          { scaleX }
        ],
      }}>
        {/* Animated border glow */}
        <Animated.View style={[
          styles.ctaCardGlow,
          { 
            borderColor,
            shadowColor: accentColor,
            shadowOpacity: borderGlow,
          }
        ]} />
        
        <TouchableOpacity
          onPress={onPress}
          onPressIn={() => Animated.spring(pressScale, { toValue: 0.95, friction: 5, useNativeDriver: Platform.OS !== 'web' }).start()}
          onPressOut={() => Animated.spring(pressScale, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== 'web' }).start()}
          activeOpacity={1}
          style={[styles.ctaCard, { backgroundColor: color }]}
        >
          <View style={[styles.ctaAccent, { backgroundColor: accentColor }]} />
          <View style={[styles.ctaAccentSecond, { backgroundColor: accentColor }]} />
          
          {/* Glow overlay */}
          <Animated.View style={[
            StyleSheet.absoluteFillObject, 
            { backgroundColor: '#fff', opacity: glowOpacity, borderRadius: 20 }
          ]} />
          
          {/* Shimmer effect */}
          <Animated.View style={[
            styles.shimmerEffect,
            { transform: [{ translateX: shimmerX }, { rotate: '20deg' }] }
          ]} />
          
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconWrap}>
              <Text style={styles.ctaIcon}>{icon}</Text>
            </View>
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

// ─── Dust Particle (Enhanced Cinematic) ───────────────────────
const DustParticle = ({ delay, color }) => {
  const x = useRef(new Animated.Value(-50)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  
  // Partikel menyebar lebih jauh ke kanan (mengikuti arah slide)
  const targetX = Math.random() * 180 + 80;
  const targetY = (Math.random() - 0.5) * 120;
  const size = Math.random() * 8 + 3;
  const rotateAmount = Math.random() * 180;

  useEffect(() => {
    const startDelay = delay + Math.random() * 100;
    Animated.sequence([
      Animated.delay(startDelay),
      Animated.parallel([
        // Fade in cepat, lalu fade out pelan
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.9, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(opacity, { toValue: 0.6, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        // Pop scale
        Animated.sequence([
          Animated.spring(scale, { toValue: 1.3, friction: 3, tension: 100, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(scale, { toValue: 0.8, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        // Movement ke kanan
        Animated.timing(x, { toValue: targetX, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(y, { toValue: targetY, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(rotate, { toValue: rotateAmount, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  });

  return (
    <Animated.View style={{
      position: 'absolute', left: '5%', top: '50%',
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity,
      transform: [{ translateX: x }, { translateY: y }, { scale }, { rotate: spin }],
      pointerEvents: 'none', zIndex: 20,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
    }} />
  );
};

// ─── Store Card ───────────────────────────────────────────────
const StoreCard = ({ store, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isDarkMode } = useApp();
  const card = isDarkMode ? '#222' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#333';
  const subText = isDarkMode ? '#999' : '#666';

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress && onPress(store)}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, friction: 5, useNativeDriver: Platform.OS !== 'web' }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== 'web' }).start()}
        activeOpacity={1} style={[styles.storeCard, { backgroundColor: card }]}
      >
        <Image 
          source={{ uri: store.image }} 
          style={styles.storeImg} 
          resizeMode="cover"
        />
        <View style={styles.storeOverlay} />
        <View style={styles.storeInfo}>
          <Text style={[styles.storeName, { color: textCol }]} numberOfLines={1}>{store.name}</Text>
          <View style={styles.storeMeta}>
            <Text style={[styles.storeDist, { color: subText }]}>📍 {store.distance}</Text>
            <View style={styles.storeRatingBadge}>
              <Text style={styles.storeRating}>⭐ {store.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Data Toko ────────────────────────────────────────────────
// Ditambah Koordinat untuk Sinkronisasi Peta
const nearbyStores = [
  { id: '1', name: 'Warteg Bahari',     distance: '0.5 km', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80', lat: -6.2088, lng: 106.8456 },
  { id: '2', name: 'Sate Khas Senayan', distance: '1.2 km', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', lat: -6.2150, lng: 106.8500 },
  { id: '3', name: 'Ayam Geprek Bensu', distance: '2.0 km', rating: 4.2, image: 'https://images.unsplash.com/photo-1626804475297-41609ea0ebb3?w=500&q=80', lat: -6.2000, lng: 106.8350 },
  { id: '4', name: 'Nasi Goreng Gila',  distance: '2.5 km', rating: 4.6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80', lat: -6.2200, lng: 106.8400 },
];

// ─── Main Screen ──────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { 
    isDarkMode, userProfile, cart, menuItems, 
    userLocation, updateUserLocation 
  } = useApp();
  const theme   = isDarkMode ? darkTheme : lightTheme;
  const bg      = isDarkMode ? '#0a0a0a' : '#f5f5f5';
  const card    = isDarkMode ? '#161616' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';

  const headerAnim = useRef(new Animated.Value(0)).current;

  const [locationGranted, setLocationGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  // AI Trending States
  const [aiTrends, setAiTrends] = useState([]);
  const [selectedAICategory, setSelectedAICategory] = useState('food');
  const [aiLoading, setAiLoading] = useState(false);
  const aiTranslateY = useRef(new Animated.Value(20)).current;
  const aiOpacity = useRef(new Animated.Value(0)).current;

  // Data Pesanan Fiktif
  const [nearbyOrders] = useState([
    { latitude: userLocation.latitude + 0.002, longitude: userLocation.longitude - 0.003 },
    { latitude: userLocation.latitude - 0.004, longitude: userLocation.longitude + 0.002 },
    { latitude: userLocation.latitude + 0.005, longitude: userLocation.longitude + 0.005 },
  ]);

  const fetchSuggestions = async (text) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      // BATASI HANYA DI INDONESIA (filter=countrycode:id)
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=countrycode:id&limit=5&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features) {
        setSuggestions(data.features.map(f => ({
          id: f.properties.place_id,
          name: f.properties.name || f.properties.formatted,
          fullAddress: f.properties.formatted,
          coords: { lat: f.properties.lat, lng: f.properties.lon }
        })));
      }
    } catch (e) {
      console.error('Autocomplete Error:', e);
    }
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchSuggestions(text), 600); // Debounce 600ms
  };

  const selectSuggestion = (item) => {
    updateUserLocation(item.coords.lat, item.coords.lng, item.name);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&filter=countrycode:id&limit=1&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lng, lat] = feat.geometry.coordinates;
        updateUserLocation(lat, lng, feat.properties.formatted || 'Lokasi Terpilih');
        setSearchQuery('');
        setSuggestions([]);
      }
    } catch (e) { 
      console.error(e);
    } finally {
        setIsSearching(false);
    }
  };

  const loadAITrends = async (cat) => {
    setAiLoading(true);
    Animated.parallel([
      Animated.timing(aiTranslateY, { toValue: 20, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(aiOpacity, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(async () => {
      const data = await fetchAITrends(cat);
      setAiTrends(data);
      setAiLoading(false);
      Animated.parallel([
        Animated.spring(aiTranslateY, { toValue: 0, friction: 5, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(aiOpacity, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  };

  useEffect(() => {
    loadAITrends(selectedAICategory);
  }, [selectedAICategory]);

  const handleOpenBrowse = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      Alert.alert('Error', 'Gagal membuka browser.');
    }
  };

  const handleStorePress = (store) => {
    updateUserLocation(store.lat, store.lng, store.name);
  };

  const handleMapClick = async (lat, lng) => {
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const addr = geo.length > 0 ? (geo[0].street ? `${geo[0].street}, ${geo[0].district}` : geo[0].district) : 'Lokasi Terpilih';
      updateUserLocation(lat, lng, addr);
    } catch (e) {
      updateUserLocation(lat, lng, 'Lokasi Terpilih');
    }
  };

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }).start();

    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            setLocationGranted(true);
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            if (geo.length > 0) {
              const g = geo[0];
              updateUserLocation(loc.coords.latitude, loc.coords.longitude, g.district || g.subregion || g.city);
            }
          } else {
            updateUserLocation(-6.2088, 106.8456, 'Jakarta');
          }
        } catch (e) {
          updateUserLocation(-6.2088, 106.8456, 'Jakarta');
        }
      })();
    } else {
      updateUserLocation(-6.2088, 106.8456, 'Jakarta, Indonesia');
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
        <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}>
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

      {/* ══ QUICK NAV ══ */}
      <View style={styles.ctaSection}>
        <Text style={[styles.ctaSectionTitle, { color: textCol }]}>Layanan Kami</Text>
        <CTACard
          icon="🛵"
          title="Pesan Antar"
          subtitle="Makanan favorit di depan pintu"
          color="#FF6347"
          accentColor="#FF4500"
          dustColor="#FFA07A"
          onPress={() => navigation.navigate('Menu')}
          delay={0}
        />
        <CTACard
          icon="🥡"
          title="Ambil Sendiri"
          subtitle="Pesan dulu, ambil kemudian"
          color={isDarkMode ? '#1e293b' : '#3b82f6'}
          accentColor={isDarkMode ? '#0f172a' : '#2563eb'}
          onPress={() => navigation.navigate('Menu')}
          delay={150}
        />
        <CTACard
          icon="📋"
          title="Lihat Pesanan"
          subtitle="Pantau status pesanan Anda"
          color={isDarkMode ? '#065f46' : '#10b981'}
          accentColor={isDarkMode ? '#047857' : '#059669'}
          dustColor="#34d399"
          onPress={() => navigation.navigate('History')}
          delay={300}
        />
      </View>

      {/* ══ NEARBY MAP ══ */}
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
            {userLocation.address}
          </Text>
          <View style={[styles.locationDot, { backgroundColor: locationGranted ? '#4CAF50' : '#FF6347' }]} />
        </View>

        <View style={styles.mapBox}>
          {/* 🔍 Search Bar Overlay */}
          <View style={styles.searchOverlay}>
            <View style={[styles.searchInner, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={isDarkMode ? '#aaa' : '#666'} />
              <TextInput 
                style={[styles.searchInput, { color: textCol }]}
                placeholder="Cari lokasi baru (Indonesia)..."
                placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                value={searchQuery}
                onChangeText={handleTextChange}
                onSubmitEditing={handleSearch}
              />
              {isSearching ? (
                <ActivityIndicator size="small" color="#FF6347" />
              ) : (
                searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color="#aaa" />
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Suggestions List Overlay */}
            {suggestions.length > 0 && (
              <View style={[styles.suggestionList, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
                {suggestions.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <MaterialCommunityIcons name="map-marker-outline" size={18} color={isDarkMode ? '#eee' : '#333'} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.suggestionName, { color: textCol }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.suggestionAddress} numberOfLines={1}>{item.fullAddress}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <MapComponent
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            isDarkMode={isDarkMode}
            locationName={userLocation.address}
            height={350}
            onLocationSelect={handleMapClick}
            nearbyOrders={nearbyOrders}
          />
        </View>

        {/* Store cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeScroll}>
          {nearbyStores.map(store => <StoreCard key={store.id} store={store} onPress={handleStorePress} />)}
        </ScrollView>
      </View>

      {/* ══ AI TRENDING EXPLORER ══ */}
      <View style={[styles.aiSection, { backgroundColor: card }]}>
        <LinearGradient
          colors={isDarkMode ? ['#1e1b4b', '#312e81'] : ['#f5f3ff', '#ede9fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiHeaderGradient}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiTitleRow}>
              <View style={styles.aiIconCircle}>
                <MaterialCommunityIcons name="brain" size={20} color="#8b5cf6" />
              </View>
              <View>
                <Text style={[styles.aiSectionTitle, { color: textCol }]}>AI Trending Explorer</Text>
                <Text style={styles.aiSectionSub}>Prediksi kuliner viral dari internet</Text>
              </View>
            </View>
            <View style={styles.aiGlowDot} />
          </View>

          <View style={styles.aiCategoryRow}>
            {[
              { id: 'food', label: 'Makanan', icon: 'food-variant' },
              { id: 'drink', label: 'Minuman', icon: 'cup-water' },
              { id: 'snack', label: 'Jajanan', icon: 'cookie' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedAICategory(cat.id)}
                style={[
                  styles.aiCatTab,
                  selectedAICategory === cat.id && { backgroundColor: isDarkMode ? '#4c1d95' : '#8b5cf6' }
                ]}
              >
                <MaterialCommunityIcons 
                  name={cat.icon} 
                  size={16} 
                  color={selectedAICategory === cat.id ? '#fff' : (isDarkMode ? '#888' : '#666')} 
                />
                <Text style={[
                  styles.aiCatText,
                  { color: selectedAICategory === cat.id ? '#fff' : (isDarkMode ? '#888' : '#666') }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.aiContent}>
          {aiLoading ? (
            <View style={styles.aiLoader}>
              <ActivityIndicator color="#8b5cf6" />
            </View>
          ) : (
            <Animated.View style={{ opacity: aiOpacity, transform: [{ translateY: aiTranslateY }] }}>
              {aiTrends.map((trend) => (
                <TouchableOpacity 
                  key={trend.id} 
                  style={[styles.aiTrendCard, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}
                  onPress={() => handleOpenBrowse(trend.sourceUrl)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: trend.image }} style={styles.aiTrendImg} />
                  <View style={styles.aiTrendInfo}>
                    <View style={styles.aiTrendTag}>
                      <Text style={styles.aiTrendTagTxt}>🔥 HOT MATCH {trend.matchScore}%</Text>
                    </View>
                    <Text style={[styles.aiTrendTitle, { color: textCol }]}>{trend.title}</Text>
                    <Text style={styles.aiTrendDesc} numberOfLines={2}>{trend.description}</Text>
                    <View style={styles.aiTrendFooter}>
                      <Text style={styles.aiBrowseBtn}>🌍 Browse Sumber Tren</Text>
                      <MaterialCommunityIcons name="open-in-new" size={14} color="#8b5cf6" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
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

  // CTA - Cinematic Style
  ctaSection:       { padding: 16, paddingTop: 20, overflow: 'visible' },
  ctaSectionTitle:  { fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: 0.3 },
  ctaWrap:          { marginBottom: 16, position: 'relative', overflow: 'visible' },
  ctaCard:          { borderRadius: 20, overflow: 'hidden', position: 'relative' },
  ctaCardGlow:      { 
    ...StyleSheet.absoluteFillObject, 
    borderRadius: 22, 
    borderWidth: 2, 
    margin: -2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
    pointerEvents: 'none',
  },
  ctaAccent:        { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, opacity: 0.25 },
  ctaAccentSecond:  { position: 'absolute', bottom: -40, left: -20, width: 80, height: 80, borderRadius: 40, opacity: 0.15 },
  ctaContent:       { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 },
  ctaIconWrap:      { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  ctaIcon:          { fontSize: 28 },
  ctaTitle:         { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 3, letterSpacing: 0.3 },
  ctaSub:           { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  ctaArrow:         { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  ctaArrowTxt:      { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  shimmerEffect:    { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: 60, 
    height: '200%', 
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

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
  mapBox:           { width: '100%', height: 350, borderRadius: 14, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  searchOverlay:    { position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 },
  searchInner:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  searchInput:      { flex: 1, marginLeft: 8, fontSize: 13, paddingVertical: 0 },
  suggestionList:   { marginTop: 4, borderRadius: 12, padding: 8, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  suggestionItem:   { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  suggestionName:   { fontSize: 14, fontWeight: '700' },
  suggestionAddress:{ fontSize: 11, color: '#888', marginTop: 2 },
  mapLoading:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  mapPinLabel:      { position: 'absolute', bottom: 8, left: 8, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  mapPinTxt:        { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Store scroll
  storeScroll:      { marginHorizontal: -4 },
  storeCard:        { width: 150, marginRight: 12, borderRadius: 14, overflow: 'hidden' },
  storeImg:         { width: '100%', height: 100 },
  storeOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  storeInfo:        { padding: 10 },
  storeName:        { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  storeMeta:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeDist:        { fontSize: 10 },
  storeRatingBadge: { backgroundColor: 'rgba(255,99,71,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  storeRating:      { fontSize: 10, color: '#fff', fontWeight: 'bold' },

  // AI Section Styles
  aiSection: { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  aiHeaderGradient: { padding: 16 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  aiSectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  aiSectionSub: { fontSize: 9, color: '#888', marginTop: 2 },
  aiGlowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6', shadowColor: '#8b5cf6', shadowRadius: 10, shadowOpacity: 1, elevation: 5 },
  aiCategoryRow: { flexDirection: 'row', gap: 10 },
  aiCatTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, gap: 6, backgroundColor: 'rgba(0,0,0,0.05)' },
  aiCatText: { fontSize: 12, fontWeight: '700' },
  aiContent: { padding: 16, paddingTop: 10 },
  aiLoader: { padding: 40, alignItems: 'center' },
  aiTrendCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  aiTrendImg: { width: 100, height: 120 },
  aiTrendInfo: { flex: 1, padding: 12 },
  aiTrendTag: { alignSelf: 'flex-start', backgroundColor: '#8b5cf615', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
  aiTrendTagTxt: { fontSize: 9, fontWeight: '900', color: '#8b5cf6' },
  aiTrendTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  aiTrendDesc: { fontSize: 11, color: '#666', lineHeight: 16 },
  aiTrendFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  aiBrowseBtn: { fontSize: 11, fontWeight: '700', color: '#8b5cf6' },

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
