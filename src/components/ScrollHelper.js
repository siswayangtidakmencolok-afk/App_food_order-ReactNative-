import React, { useRef, useState } from 'react';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// ─── Hook ───────────────────────────────────────────
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
      y + layoutHeightRef.current >= contentHeightRef.current - 80;
    setIsAtBottom(isNearBottom);
  };

  const scrollProps = {
    ref: scrollRef,
    onScroll: handleScroll,
    scrollEventThrottle: 16,
    onLayout: (e) => { layoutHeightRef.current = e.nativeEvent.layout.height; },
    onContentSizeChange: (_, h) => { contentHeightRef.current = h; },
  };

  return { scrollRef, scrollYValue, isAtBottom, scrollProps };
};

// ─── Komponen tombol – selalu terlihat, fixed ke pojok kanan layar ───
const ScrollHelper = ({ scrollRef, isAtBottom }) => {
  const { isDarkMode } = useApp();

  const handlePress = () => {
    if (!scrollRef?.current) return;
    try {
      if (isAtBottom) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      } else {
        scrollRef.current.scrollToEnd({ animated: true });
      }
    } catch (_) {
      // FlatList fallback
      try {
        if (isAtBottom) {
          scrollRef.current.scrollToOffset({ offset: 0, animated: true });
        } else {
          scrollRef.current.scrollToEnd({ animated: true });
        }
      } catch (__) {}
    }
  };

  // position fixed di web agar selalu menempel di pojok kanan viewport
  const containerStyle = Platform.OS === 'web'
    ? { position: 'fixed', bottom: 110, right: 16, zIndex: 99999 }
    : { position: 'absolute', bottom: 120, right: 16, zIndex: 99999 };

  const bg = isDarkMode ? 'rgba(18,18,18,0.95)' : 'rgba(255,255,255,0.97)';
  const iconColor = isAtBottom ? '#FF6347' : '#EE4D2D';

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.btn, { backgroundColor: bg }]}
      >
        <MaterialCommunityIcons
          name={isAtBottom ? 'chevron-up' : 'chevron-double-down'}
          size={22}
          color={iconColor}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(238, 77, 45, 0.25)',
  },
});

export default ScrollHelper;
