import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const iconMap = {
  'food-loading': 'chef-hat',
  'delivery': 'motorbike',
  'success': 'ticket-percent',
};

export default function OnboardingAnimation({ name, style }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[style, styles.container]}>
      <Animated.View style={[
        styles.iconWrapper,
        { transform: [{ translateY: floatAnim }] }
      ]}>
        <MaterialCommunityIcons 
          name={iconMap[name] || 'silverware'} 
          size={80} 
          color="#FF6347" 
        />
      </Animated.View>
      <Animated.View style={[
        styles.shadow,
        {
          opacity: floatAnim.interpolate({
            inputRange: [-15, 0],
            outputRange: [0.02, 0.05],
          }),
          transform: [{ scale: floatAnim.interpolate({
            inputRange: [-15, 0],
            outputRange: [0.8, 1],
          }) }]
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    zIndex: 2,
  },
  shadow: {
    position: 'absolute',
    bottom: -20,
    width: 100,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#000',
  }
});