// src/screens/OnboardingScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OnboardingAnimation from '../components/OnboardingAnimation';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Pesan Makanan\nFavoritmu',
    tag: 'KUALITAS BINTANG LIMA',
    desc: 'Temukan menu lezat dari restoran terbaik di sekitarmu.',
    animationKey: 'food-loading',
  },
  {
    id: '2',
    title: 'Pengiriman\nSuper Cepat',
    tag: 'SAMPAI DALAM 30 MENIT',
    desc: 'Kurir kami siap antarkan pesananmu dengan pelacakan real-time.',
    animationKey: 'delivery',
  },
  {
    id: '3',
    title: 'Promo\nExclusive',
    tag: 'HEMAT SETIAP HARI',
    desc: 'Diskon dan promo menarik setiap hari khusus Sobat FoodsStreets.',
    animationKey: 'success',
  },
];

// ─────────────────────────────────────────
//  Phase 1: Cinematic Intro (Wave + Brand)
// ─────────────────────────────────────────
function CinematicIntro({ onDone }) {
  const waveAnim  = useRef(new Animated.Value(0)).current; // 0→1 wave cover
  const titleAnim = useRef(new Animated.Value(0)).current;
  const tagAnim   = useRef(new Animated.Value(0)).current;
  const exitAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Wave rises to cover screen
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
      // 2. Brand text appears
      Animated.parallel([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(tagAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
      // 3. Hold
      Animated.delay(1300),
      // 4. Fade out
      Animated.timing(exitAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, []);

  // Wave translates from bottom (height) → 0
  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  // Title slides up + fades in
  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const tagTranslateY = tagAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View style={[styles.introWrap, { opacity: exitAnim }]}>
      {/* Dark background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a' }]} />

      {/* Rising Wave */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateY: waveTranslateY }] }]}
      >
        <LinearGradient
          colors={['#FF4500', '#FF6347', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Brand Center */}
      <View style={styles.introCenter}>
        {/* Stacked Text Effect (like Monarch Bank reference) */}
        <Animated.View
          style={{
            opacity: titleAnim,
            transform: [{ translateY: titleTranslateY }],
            alignItems: 'center',
          }}
        >
          {/* Shadow layer 1 */}
          <Text style={[styles.introTitle, styles.introTitleLayer1]}>
            <Text style={styles.introBrand}>F</Text>oodsStreets
          </Text>
          {/* Shadow layer 2 */}
          <Text style={[styles.introTitle, styles.introTitleLayer2, styles.introTitleAbs]}>
            <Text style={styles.introBrand}>F</Text>oodsStreets
          </Text>
          {/* Main text */}
          <Text style={[styles.introTitle, styles.introTitleMain, styles.introTitleAbs]}>
            <Text style={styles.introBrand}>F</Text>oodsStreets
          </Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.introTagline,
            { opacity: tagAnim, transform: [{ translateY: tagTranslateY }] },
          ]}
        >
          Pesan. Nikmati. Ulangi.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
//  Phase 2: Content Slides
// ─────────────────────────────────────────
const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const [phase, setPhase] = useState('intro'); // 'intro' | 'slides'
  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(1)).current;

  const goToNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -90, duration: 350, useNativeDriver: true }),
      Animated.timing(smokeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(i => i + 1);
        slideAnim.setValue(90);
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
          Animated.timing(smokeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]).start();
      } else {
        onFinish();
      }
    });
  };

  if (phase === 'intro') {
    return <CinematicIntro onDone={() => setPhase('slides')} />;
  }

  const slide = slides[currentIndex];
  const bg = isDarkMode ? '#0a0a0a' : '#fff8f0';
  const textColor = isDarkMode ? '#ffffff' : '#111111';
  const descColor = isDarkMode ? '#aaaaaa' : '#666666';

  return (
    <View style={[styles.slidesWrap, { backgroundColor: bg }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={isDarkMode ? ['#0a0a0a', '#1a0800'] : ['#fff8f0', '#ffffff']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Slide Content (animated) ── */}
      <Animated.View
        style={[
          styles.slideContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Tag */}
        <Animated.Text
          style={[
            styles.slideTag,
            {
              opacity: smokeAnim,
              transform: [
                {
                  translateY: smokeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {slide.tag}
        </Animated.Text>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <OnboardingAnimation name={slide.animationKey} style={styles.animation} />
        </View>

        {/* Title */}
        <Animated.Text
          style={[
            styles.slideTitle,
            {
              color: textColor,
              opacity: smokeAnim,
              transform: [
                {
                  translateY: smokeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {slide.title}
        </Animated.Text>

        {/* Description */}
        <Animated.Text
          style={[
            styles.slideDesc,
            {
              color: descColor,
              opacity: smokeAnim,
              transform: [
                {
                  translateY: smokeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [36, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {slide.desc}
        </Animated.Text>
      </Animated.View>

      {/* ── Fixed Footer ── */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? '#FF6347' : 'rgba(180,180,180,0.25)',
                  width: i === currentIndex ? 28 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={goToNext}
          style={styles.btnShadow}
        >
          <LinearGradient
            colors={['#FF8C00', '#FF4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {currentIndex === slides.length - 1 ? 'Mulai Sekarang 🔥' : 'Lanjutkan →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Intro ──
  introWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  introCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 36,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  introBrand: {
    fontWeight: '900',
    fontSize: 40,
  },
  // Stacked text layers (like Monarch Bank reference)
  introTitleLayer1: {
    opacity: 0.15,
    marginBottom: -36,  // stack on top of each other
  },
  introTitleLayer2: {
    opacity: 0.4,
  },
  introTitleMain: {
    opacity: 1,
  },
  introTitleAbs: {
    marginTop: -36, // stack over previous
  },
  introTagline: {
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // ── Slides ──
  slidesWrap: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: height * 0.1,
  },
  slideTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF6347',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  iconWrap: {
    marginBottom: 28,
  },
  animation: {
    width: width * 0.52,
    height: width * 0.52,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  // ── Footer (fixed below content) ──
  footer: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    paddingTop: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnShadow: {
    width: width * 0.68,
    maxWidth: 340,
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default OnboardingScreen;
