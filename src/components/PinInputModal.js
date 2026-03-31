// src/components/PinInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions, Platform, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WALLET_CONFIG = {
  ovo: { 
    name: 'OVO', color: '#4C2B86', 
    logo: 'https://p7.hiclipart.com/preview/415/786/14/ovo-logo-brand-font-payment-merchant.jpg' 
  },
  gopay: { 
    name: 'GoPay', color: '#00AED6', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/1024px-Gopay_logo.svg.png' 
  },
  dana: { 
    name: 'DANA', color: '#118EEA', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/1024px-Logo_dana_blue.svg.png' 
  },
  default: { 
    name: 'E-Wallet', color: '#333', 
    logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' 
  }
};

const PinInputModal = ({ visible, walletType, onComplete, onCancel }) => {
  const config = WALLET_CONFIG[walletType?.toLowerCase()] || WALLET_CONFIG.default;
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPin('');
      setIsError(false);
      setIsVerifying(false);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  const handlePress = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleBack = () => {
    setPin(pin.slice(0, -1));
  };

  const verifyPin = (finalPin) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onComplete(finalPin);
    }, 1200);
  };

  const renderDot = (index) => {
    const active = pin.length > index;
    return (
      <View key={index} style={[
        styles.dot,
        active && { backgroundColor: config.color, borderColor: config.color, transform: [{ scale: 1.2 }] },
        isError && { backgroundColor: '#ff4444', borderColor: '#ff4444' }
      ]} />
    );
  };

  const renderKey = (val) => (
    <TouchableOpacity 
      key={val} 
      style={styles.key} 
      onPress={() => handlePress(val)}
      disabled={isVerifying}
    >
      <Text style={styles.keyText}>{val}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          
          {/* Glassmorphism Header */}
          <View style={styles.headerContainer}>
            <View style={[styles.glassHeader, { borderBottomColor: config.color + '30' }]}>
              <Image source={{ uri: config.logo }} style={styles.walletLogo} resizeMode="contain" />
              <View style={styles.headerText}>
                <Text style={styles.title}>Konfirmasi Transaksi</Text>
                <Text style={styles.walletName}>{config.name}</Text>
              </View>
              <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>

          {/* PIN Indicators */}
          <View style={styles.content}>
            <Text style={styles.prompt}>Masukkan 6 digit PIN {config.name} Anda</Text>
            <Animated.View style={[styles.dotContainer, { transform: [{ translateX: shakeAnim }] }]}>
              {[0, 1, 2, 3, 4, 5].map(renderDot)}
            </Animated.View>
            
            {isVerifying ? (
              <View style={styles.verifyingContainer}>
                <Animated.Text style={[styles.verifyingText, { color: config.color }]}>🔐 Sedang memverifikasi ke aman...</Animated.Text>
              </View>
            ) : (
              <Text style={styles.secureText}>Keamanan Terjamin oleh BI & OJK</Text>
            )}
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            <View style={styles.row}>{[1, 2, 3].map(renderKey)}</View>
            <View style={styles.row}>{[4, 5, 6].map(renderKey)}</View>
            <View style={styles.row}>{[7, 8, 9].map(renderKey)}</View>
            <View style={styles.row}>
              <View style={styles.keyPlaceholder} />
              {renderKey(0)}
              <TouchableOpacity style={styles.key} onPress={handleBack}>
                <MaterialCommunityIcons name="backspace-outline" size={26} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.safeBottom} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20
  },
  headerContainer: {
    marginTop: -15, alignItems: 'center'
  },
  glassHeader: {
    width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 20, 
    borderBottomWidth: 1, backgroundColor: 'rgba(255,255,255,0.8)'
  },
  walletLogo: {
    width: 50, height: 35, marginRight: 15
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 1
  },
  walletName: {
    fontSize: 18, fontWeight: 'bold', color: '#333'
  },
  closeBtn: { padding: 5 },
  content: { alignItems: 'center', paddingVertical: 35 },
  prompt: { fontSize: 15, color: '#666', marginBottom: 25 },
  dotContainer: { flexDirection: 'row', gap: 15 },
  dot: {
    width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#eee'
  },
  verifyingContainer: { marginTop: 25 },
  verifyingText: { fontWeight: 'bold', fontSize: 13 },
  secureText: { marginTop: 25, fontSize: 11, color: '#bbb' },
  keypad: { paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  key: { 
    width: '30%', height: 55, borderRadius: 15, backgroundColor: '#f8f9fa',
    justifyContent: 'center', alignItems: 'center'
  },
  keyPlaceholder: { width: '30%' },
  keyText: { fontSize: 22, fontWeight: '600', color: '#333' },
  safeBottom: { height: 15 }
});

export default PinInputModal;

