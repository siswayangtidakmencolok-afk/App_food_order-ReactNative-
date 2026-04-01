import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, Animated, View, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const GlobalToast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-40)).current;

  useImperativeHandle(ref, () => ({
    show: (msg, t = 'success') => {
      setMessage(msg);
      setType(t);
      setVisible(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(slideAnim, { toValue: 20, friction: 8, tension: 40, useNativeDriver: Platform.OS !== 'web' })
      ]).start();

      setTimeout(() => {
        hide();
      }, 3000);
    },
    hide: () => hide()
  }));

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue: -40, duration: 300, useNativeDriver: Platform.OS !== 'web' })
    ]).start(() => setVisible(false));
  };

  if (!visible) return null;

  const getIcon = () => {
    switch(type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information';
      default: return 'bell';
    }
  };

  const getColors = () => {
    if (type === 'success') return ['#4CAF50', '#2E7D32'];
    if (type === 'error') return ['#F44336', '#D32F2F'];
    return ['#FF6347', '#FF4500'];
  };

  return (
    <Animated.View style={[
      styles.container, 
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toast}
      >
        <MaterialCommunityIcons name={getIcon()} size={22} color="#fff" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GlobalToast;
