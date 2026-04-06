import React, { useRef, useState, useEffect } from 'react';
import { TouchableOpacity, Platform, StyleSheet, View, Text } from 'react-native';
import { useApp } from '../context/AppContext';

// Hook untuk dipakai di tiap screen yang butuh scroll helper
export const useScrollHelper = () => {
  const scrollRef = useRef(null);
  const scrollYValue = useRef(0);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollYValue.current = y;

    const isNearBottom =
      contentHeightRef.current > 0 &&
      y + layoutHeightRef.current >= contentHeightRef.current - 200;

    setIsAtBottom(isNearBottom);
  };

  const scrollProps = {
    ref: scrollRef,
    onScroll: handleScroll,
    scrollEventThrottle: 16,
    onLayout: (e) => { layoutHeightRef.current = e.nativeEvent.layout.height; },
    onContentSizeChange: (w, h) => { contentHeightRef.current = h; },
  };

  return { scrollRef, scrollYValue, isAtBottom, scrollProps };
};

// Komponen tombol scroll yang selalu menempel di sudut kanan layar (fixed position)
const ScrollHelper = ({ scrollRef, scrollYValue, isAtBottom }) => {
  const { isDarkMode } = useApp();

  const handlePress = () => {
    if (!scrollRef?.current) return;

    if (isAtBottom) {
      // Kembali ke paling atas
      try { scrollRef.current.scrollTo({ y: 0, animated: true }); } catch (e) {
        try { scrollRef.current.scrollToOffset({ offset: 0, animated: true }); } catch (_) {}
      }
    } else {
      // Turun 400px
      const targetY = (scrollYValue?.current || 0) + 400;
      try { scrollRef.current.scrollTo({ y: targetY, animated: true }); } catch (e) {
        try { scrollRef.current.scrollToOffset({ offset: targetY, animated: true }); } catch (_) {}
      }
    }
  };

  // Gaya fixed untuk web agar tombol selalu di pojok kanan layar
  const fixedStyle = Platform.OS === 'web' ? {
    position: 'fixed',
    bottom: 90,
    right: 20,
    zIndex: 99999,
  } : {
    // Native: pakai absolute tapi harus di root screen (ditangani oleh parent screen)
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 99999,
  };

  const buttonBg = isDarkMode
    ? 'rgba(25, 25, 25, 0.92)'
    : 'rgba(255, 255, 255, 0.95)';

  return (
    <View style={fixedStyle} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBg }]}
        onPress={handlePress}
        activeOpacity={0.75}
      >
        <Text style={[styles.arrow, { color: '#EE4D2D' }]}>
          {isAtBottom ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(238, 77, 45, 0.35)',
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    includeFontPadding: false,
    lineHeight: 22,
  },
});

export default ScrollHelper;
