// src/screens/SplashScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const [percent, setPercent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleLogo = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleLogo, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // 2. Progress Logic
    const duration = 3000;
    const interval = 30;
    let current = 0;
    const step = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      current += step;
      if (current >= 100) {
        setPercent(100);
        clearInterval(timer);
        // Fade out before finish
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => onFinish());
      } else {
        setPercent(Math.floor(current));
      }
    }, interval);

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // 3. Text Reveal
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(textOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    return () => clearInterval(timer);
  }, []);

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleLogo }] }]}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={50} color="#FF6347" />
          </View>
          <View style={styles.glowEffect} />
        </Animated.View>

        {/* Brand Section */}
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.brandName}>FoodsStreets</Text>
          <Text style={styles.tagline}>Street Food Experience, Reimagined</Text>
        </Animated.View>

        {/* Loading Section */}
        <View style={styles.loadingArea}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.loadingText}>Menyiapkan Kelezatan...</Text>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
          
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: progressBarWidth }]}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['#FFB347', '#FF6347']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          
          <Text style={styles.footerText}>by fhaz</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 99, 71, 0.3)',
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 99, 71, 0.05)',
    zIndex: -1,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6347',
    letterSpacing: 2,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
    fontWeight: '300',
  },
  loadingArea: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  percentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  barTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerText: {
    marginTop: 20,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    letterSpacing: 4,
    textAlign: 'center',
  }
});

export default SplashScreen;