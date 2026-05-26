import React, { useRef, useEffect } from 'react';
import { Animated, Easing, Dimensions, Platform, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');

const ConfettiParticle = ({ delay, color, x }) => {
  const y = useRef(new Animated.Value(-50)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const sway = useRef(new Animated.Value(0)).current;
  
  const size = Math.random() * 8 + 6;
  const duration = Math.random() * 1500 + 2000;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, {
          toValue: height + 50,
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(rotate, {
          toValue: 720,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.sequence([
          Animated.delay(duration - 600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]),
        // Efek goyangan menyamping
        Animated.loop(
          Animated.sequence([
            Animated.timing(sway, { toValue: 15, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(sway, { toValue: -15, duration: 400, useNativeDriver: Platform.OS !== 'web' })
          ]),
          { iterations: 4 }
        )
      ])
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[
      styles.confetti,
      {
        left: x,
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
        transform: [
          { translateY: y },
          { rotate: spin },
          { translateX: sway }
        ]
      }
    ]} />
  );
};

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 99999,
  }
});

export default ConfettiParticle;
