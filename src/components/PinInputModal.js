// src/components/PinInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WALLET_CONFIG = {
  ovo: { name: 'OVO', color: '#4C2B86', icon: 'wallet-outline' },
  gopay: { name: 'GoPay', color: '#00AED6', icon: 'wallet-outline' },
  dana: { name: 'DANA', color: '#118EEA', icon: 'wallet-outline' },
  shopeepay: { name: 'ShopeePay', color: '#EE4D2D', icon: 'wallet-outline' },
  default: { name: 'E-Wallet', color: '#333', icon: 'wallet-outline' }
};

const PinInputModal = ({ visible, walletType, onComplete, onCancel }) => {
  const config = WALLET_CONFIG[walletType?.toLowerCase()] || WALLET_CONFIG.default;
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setPin('');
      setIsError(false);
      setIsVerifying(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true
      }).start();
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
    // Simulasi verifikasi API (1.5 detik)
    setTimeout(() => {
      setIsVerifying(false);
      // Untuk tugas ini, semua PIN 6 angka dianggap valid (seperti permintaan user)
      onComplete(finalPin);
    }, 1500);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const renderDot = (index) => {
    const active = pin.length > index;
    return (
      <View key={index} style={[
        styles.dot,
        active && { backgroundColor: config.color, borderColor: config.color },
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
      <View style={styles.overlay}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: config.color + '20' }]}>
            <View style={[styles.walletIcon, { backgroundColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.title}>Konfirmasi PIN {config.name}</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* PIN Indicators */}
          <View style={styles.content}>
            <Text style={styles.prompt}>Masukkan 6 digit PIN Anda</Text>
            <Animated.View style={[styles.dotContainer, { transform: [{ translateX: shakeAnim }] }]}>
              {[0, 1, 2, 3, 4, 5].map(renderDot)}
            </Animated.View>
            
            {isVerifying && (
              <Text style={[styles.verifyingText, { color: config.color }]}>Memverifikasi PIN...</Text>
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
                <MaterialCommunityIcons name="backspace-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.safeBottom} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1
  },
  walletIcon: {
    width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  title: {
    fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1
  },
  closeBtn: { padding: 5 },
  content: { alignItems: 'center', paddingVertical: 40 },
  prompt: { fontSize: 16, color: '#666', marginBottom: 25 },
  dotContainer: { flexDirection: 'row', gap: 15 },
  dot: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#ddd'
  },
  verifyingText: { marginTop: 20, fontWeight: 'bold', fontSize: 13 },
  keypad: { paddingBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  key: { 
    width: '30%', height: 60, borderRadius: 12, backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center'
  },
  keyPlaceholder: { width: '30%' },
  keyText: { fontSize: 24, fontWeight: '600', color: '#333' },
  safeBottom: { height: 20 }
});

export default PinInputModal;
