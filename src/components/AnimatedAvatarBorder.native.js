// Native fallback — rotating arc pakai Animated
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function AnimatedAvatarBorder({ initials, size = 100, accentColor = '#FF6347' }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: false })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.ring3, {
        width: size, height: size, borderRadius: size / 2,
        borderColor: accentColor + '44',
        transform: [{ rotate: spin }, { scale: pulseAnim }],
      }]} />
      <Animated.View style={[styles.ring2, {
        position: 'absolute',
        width: size * 0.88, height: size * 0.88,
        borderRadius: size * 0.44,
        borderColor: accentColor + '77',
        transform: [{ rotate: spin }],
      }]} />
      <View style={[styles.avatar, {
        position: 'absolute',
        width: size * 0.68, height: size * 0.68,
        borderRadius: size * 0.34,
        borderColor: accentColor,
        backgroundColor: accentColor + '33',
      }]}>
        <Text style={[styles.initials, { fontSize: size * 0.24 }]}>{initials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring3:     { position: 'absolute', borderWidth: 1.5, borderStyle: 'dashed' },
  ring2:     { borderWidth: 2 },
  avatar:    { borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  initials:  { fontWeight: '900', color: '#fff' },
});