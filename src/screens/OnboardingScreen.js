import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import OnboardingAnimation from '../components/OnboardingAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Pesan Makanan Favoritmu',
    description: 'Temukan berbagai macam menu lezat dari restoran terbaik di sekitarmu dengan mudah dan cepat.',
    animationKey: 'food-loading',
  },
  {
    id: '2',
    title: 'Pengiriman Super Cepat',
    description: 'Kurir kami siap mengantarkan pesananmu dalam waktu kurang dari 30 menit. Hangat sampai tujuan!',
    animationKey: 'delivery',
  },
  {
    id: '3',
    title: 'Nikmati Promo Menarik',
    description: 'Dapatkan diskon dan promo menarik setiap harinya untuk lebih hemat. Yuk, mulai pesan sekarang!',
    animationKey: 'success',
  }
];

const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToNext = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onFinish();
        return;
      }
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Slide Content */}
      <Animated.View style={[styles.slideContainer, { opacity: fadeAnim }]}>
        <OnboardingAnimation
          name={currentSlide.animationKey}
          style={styles.animation}
        />
        <View style={styles.textContainer}>
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
                  backgroundColor: i === currentIndex ? theme.primary : theme.border || '#ccc',
                  width: i === currentIndex ? 20 : 10,
                }
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={goToNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Selanjutnya'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    height: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    width: width * 0.8,
    maxWidth: 400,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;