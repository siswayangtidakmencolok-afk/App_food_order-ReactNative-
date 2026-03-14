// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Animasi fade in + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Setelah 2.5 detik, pindah ke app
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {Platform.OS !== 'web' ? (
          <LottieView
            source={require('../assets/lottie/food-loading.json')}
            autoPlay
            loop
            style={styles.logoAnimation}
          />
        ) : (
          <Text style={{fontSize: 80, marginBottom: 20}}>🍔</Text>
        )}
        <Text style={styles.title}>FoodApp</Text>
        <Text style={styles.subtitle}>Pesan Makanan Favoritmu</Text>
      </Animated.View>
      
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.loading}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoAnimation: {
    width: 250,
    height: 250,
    marginBottom: 0,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  loading: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
});

export default SplashScreen;