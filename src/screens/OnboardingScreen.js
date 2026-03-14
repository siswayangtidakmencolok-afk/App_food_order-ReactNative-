// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { useApp } from '../context/AppContext';
import { darkTheme, lightTheme } from '../config/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Pesan Makanan Favoritmu',
    description: 'Temukan berbagai macam menu lezat dari restoran terbaik di sekitarmu dengan mudah dan cepat.',
    animation: require('../assets/lottie/food-loading.json'),
  },
  {
    id: '2',
    title: 'Pengiriman Super Cepat',
    description: 'Kurir kami siap mengantarkan pesananmu dalam waktu kurang dari 30 menit. Hangat sampai tujuan!',
    animation: require('../assets/lottie/delivery.json'),
  },
  {
    id: '3',
    title: 'Nikmati Promo Menarik',
    description: 'Dapatkan diskon dan promo menarik setiap harinya untuk lebih hemat. Yuk, mulai pesan sekarang!',
    animation: require('../assets/lottie/success.json'),
  }
];

const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const Paginator = ({ data, scrollX }) => {
    return (
      <View style={{ flexDirection: 'row', height: 64 }}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.primary,
                },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 3 }}>
        <Animated.FlatList 
          data={slides}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              {Platform.OS !== 'web' ? (
                <LottieView
                  source={item.animation}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              ) : (
                <View style={[styles.animation, { justifyContent: 'center', alignItems: 'center' }]}>
                   <Text style={{ fontSize: 80 }}>✨</Text>
                </View>
              )}
              <View style={{ flex: 0.3, alignItems: 'center', paddingHorizontal: 30 }}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>
      
      <View style={styles.footer}>
        <Paginator data={slides} scrollX={scrollX} />
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={scrollToNext}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width * 0.8,
    flex: 0.7,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontWeight: '300',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 24,
    fontSize: 16,
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.8,
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
  }
});

export default OnboardingScreen;
