// src/screens/OnboardingScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import OnboardingAnimation from '../components/OnboardingAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Pesan Makanan Favoritmu',
    subtitle: 'KUALITAS BINTANG LIMA',
    description: 'Temukan berbagai macam menu lezat dari restoran terbaik di sekitarmu dengan mudah dan cepat.',
    animationKey: 'food-loading',
  },
  {
    id: '2',
    title: 'Pengiriman Super Cepat',
    subtitle: 'SAMPAI DALAM 30 MENIT',
    description: 'Kurir kami siap mengantarkan pesananmu dengan teknologi pelacakan real-time. Hangat sampai tujuan!',
    animationKey: 'delivery',
  },
  {
    id: '3',
    title: 'Promo Exclusive',
    subtitle: 'HEMAT SETIAP HARI',
    description: 'Dapatkan diskon dan promo menarik setiap harinya khusus untuk Sobat Kuliner FoodsStreets.',
    animationKey: 'success',
  }
];

const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToNext = () => {
    // Stage 1: Transition Out
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
        slideAnim.setValue(50);
        // Stage 2: Transition In
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      } else {
        onFinish();
      }
    });
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDarkMode ? ['#000', '#1a1a1a'] : ['#f8f9fa', '#fff']}
        style={StyleSheet.absoluteFill}
      />

      {/* Slide Content */}
      <Animated.View style={[
        styles.slideContainer, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <OnboardingAnimation
          name={currentSlide.animationKey}
          style={styles.animation}
        />
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {currentSlide.description}
          </Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? '#FF6347' : 'rgba(128,128,128,0.2)',
                  width: i === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={goToNext}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#FFB347', '#FF6347']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjutkan'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6347',
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    fontWeight: '900',
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  buttonWrapper: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  button: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16, // UI Standard
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default OnboardingScreen;
