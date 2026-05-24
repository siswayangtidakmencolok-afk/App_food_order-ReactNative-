// src/components/LuckySpinWheel.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Clipboard,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, G, Text as SvgText, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// ─── DAFTAR HADIAH PREMIUM ───
const REWARDS = [
  {
    id: 0,
    name: 'Nasi Goreng Spesial gratis! 🍛',
    type: 'food',
    dbName: 'Nasi Goreng Spesial',
    color: '#FF6B6B',
    emoji: '🍛',
    description: 'Nasi goreng lezat dengan telur dan ayam suwir akan otomatis ditambahkan ke keranjang belanja Anda secara gratis!'
  },
  {
    id: 1,
    name: 'Diskon 50% Seluruh Menu! 💸',
    type: 'voucher',
    code: 'FS50GOLD',
    color: '#4D96FF',
    emoji: '💸',
    description: 'Dapatkan diskon 50% tanpa minimum pembelian! Kode promo otomatis disalin ke clipboard Anda.'
  },
  {
    id: 2,
    name: 'Es Teh Manis gratis! 🍹',
    type: 'food',
    dbName: 'Es Teh Manis',
    color: '#6BCB77',
    emoji: '🍹',
    description: 'Segarnya es teh manis manis gratis! Otomatis ditambahkan ke keranjang belanja Anda.'
  },
  {
    id: 3,
    name: 'Voucher Potongan Rp 10.000! 💵',
    type: 'voucher',
    code: 'FS10KDISC',
    color: '#FFD93D',
    emoji: '💵',
    description: 'Potongan langsung Rp 10.000 untuk pembelian berikutnya. Kode promo otomatis disalin ke clipboard Anda.'
  },
  {
    id: 4,
    name: 'Gratis Ongkir Instan! 🛵',
    type: 'voucher',
    code: 'FSFREEONGKIR',
    color: '#FF9F29',
    emoji: '🛵',
    description: 'Gak perlu bayar ongkir ke mana pun! Kode promo otomatis disalin ke clipboard Anda.'
  },
  {
    id: 5,
    name: 'Zonk! Coba Lagi Besok 😢',
    type: 'zonk',
    color: '#B983FF',
    emoji: '😢',
    description: 'Wah, sayang sekali keberuntungan Anda sedang beristirahat. Tetap semangat dan coba lagi besok ya!'
  },
  {
    id: 6,
    name: 'Mie Goreng Spesial gratis! 🍜',
    type: 'food',
    dbName: 'Mie Goreng',
    color: '#38E54D',
    emoji: '🍜',
    description: 'Mie goreng pedas gurih dengan telur gratis! Otomatis ditambahkan ke keranjang belanja Anda.'
  },
  {
    id: 7,
    name: 'Kopi Susu Aren gratis! ☕',
    type: 'food',
    dbName: 'Kopi Susu Gula Aren',
    color: '#FF6FB5',
    emoji: '☕',
    description: 'Kopi susu gula aren best-seller gratis! Otomatis ditambahkan ke keranjang belanja Anda.'
  }
];

// ─── PARTIKEL KONFETI ANIMASI ───
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

const LuckySpinWheel = () => {
  const { menuItems, addToCart, addNotification, isDarkMode } = useApp();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [tickets, setTickets] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeLed, setActiveLed] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);

  // Animasi Melayang Tombol & Rotasi
  const floatAnim = useRef(new Animated.Value(0)).current;
  const coinRotateAnim = useRef(new Animated.Value(0)).current;
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const scaleReward = useRef(new Animated.Value(0)).current;

  // 12 LED Koordinat sirkuler (radius: 146)
  const leds = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const cx = 150 + 143 * Math.cos(angle);
    const cy = 150 + 143 * Math.sin(angle);
    return { id: i, cx, cy };
  });

  // Efek Floating pada Tombol Koin Emas
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.timing(coinRotateAnim, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Animasi LED Berputar saat Roda Berputar
  useEffect(() => {
    let ledTimer;
    if (isSpinning) {
      ledTimer = setInterval(() => {
        setActiveLed(prev => (prev + 1) % 12);
      }, 60);
    } else {
      ledTimer = setInterval(() => {
        setActiveLed(prev => (prev + 1) % 12);
      }, 1000); // Kedip santai saat idle
    }
    return () => clearInterval(ledTimer);
  }, [isSpinning]);

  const spinTheWheel = () => {
    if (isSpinning || tickets <= 0) return;

    setIsSpinning(true);
    setTickets(prev => prev - 1);
    setShowReward(false);
    setConfettiActive(false);

    // Pilih index pemenang secara acak
    // (Bisa disesuaikan bobotnya agar lebih menantang!)
    const rand = Math.random();
    let wonIndex = 5; // default Zonk
    if (rand < 0.12) wonIndex = 0; // Nasi Goreng
    else if (rand < 0.22) wonIndex = 1; // 50% disc
    else if (rand < 0.38) wonIndex = 2; // Es Teh
    else if (rand < 0.48) wonIndex = 3; // 10k voucher
    else if (rand < 0.60) wonIndex = 4; // Free ongkir
    else if (rand < 0.70) wonIndex = 6; // Mie Goreng
    else if (rand < 0.82) wonIndex = 7; // Kopi Aren
    else wonIndex = 5; // Zonk

    const targetReward = REWARDS[wonIndex];
    setWonReward(targetReward);

    // Perhitungan Sudut Putaran
    // Pointer menunjuk ke atas (-90 derajat). 
    // Jadi segmen pemenang harus berputar agar berada di -90 derajat.
    // Sudut tengah segmen i adalah (i * 45) + 22.5
    // Sudut putaran yang dibutuhkan: 270 - ((i * 45) + 22.5)
    const extraSpins = 6; // Jumlah putaran penuh agar visual seru
    const targetDeg = (extraSpins * 360) + (270 - (wonIndex * 45 + 22.5));

    // Reset nilai roda
    wheelRotation.setValue(0);

    // Animasi putaran fisika natural (cubic bezier ease out)
    Animated.timing(wheelRotation, {
      toValue: targetDeg,
      duration: 5000,
      easing: Easing.bezier(0.15, 0.9, 0.25, 1.0),
      useNativeDriver: Platform.OS !== 'web'
    }).start(() => {
      // Selesai Berputar
      setIsSpinning(false);
      
      // Haptics & Notifikasi Sukses
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          targetReward.type !== 'zonk' 
            ? Haptics.NotificationFeedbackType.Success 
            : Haptics.NotificationFeedbackType.Warning
        );
      }

      // Tampilkan hasil popup
      setShowReward(true);
      if (targetReward.type !== 'zonk') {
        setConfettiActive(true);
      }

      // Animasi skala popup reward
      Animated.spring(scaleReward, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web'
      }).start();
    });

    // Mengadakan getaran haptic tick berkelanjutan sepanjang putaran
    if (Platform.OS !== 'web') {
      let tickCount = 0;
      const totalTicks = 35;
      const triggerTick = () => {
        if (tickCount < totalTicks) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          tickCount++;
          // Selang waktu tick semakin lama melambat
          const delay = 100 + Math.pow(tickCount / totalTicks, 3) * 600;
          setTimeout(triggerTick, delay);
        }
      };
      // Mulai tick setelah delay awal
      setTimeout(triggerTick, 150);
    }
  };

  const handleClaimReward = () => {
    if (!wonReward) return;

    if (wonReward.type === 'food') {
      // Cari produk di menuItems database
      let targetItem = menuItems.find(item => item.name.toLowerCase() === wonReward.dbName.toLowerCase());
      
      // Fallback jika database belum sinkron
      if (!targetItem) {
        const localMenuFallback = [
          { id: 1, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
          { id: 2, name: 'Mie Goreng', price: 20000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
          { id: 4, name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
          { id: 14, name: 'Kopi Susu Gula Aren', price: 15000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400' }
        ];
        targetItem = localMenuFallback.find(item => item.name.toLowerCase() === wonReward.dbName.toLowerCase());
      }

      if (targetItem) {
        addToCart({
          id: targetItem.id,
          name: targetItem.name,
          price: 0, // DIBERI GRATIS!
          image: targetItem.image_url || targetItem.image,
          category: targetItem.category
        });
        addNotification(`🎁 Selamat! ${wonReward.dbName} gratis telah ditambahkan ke keranjang Anda!`, 'success');
      }
    } else if (wonReward.type === 'voucher') {
      Clipboard.setString(wonReward.code);
      addNotification(`🎫 Kode Voucher ${wonReward.code} berhasil disalin!`, 'success');
    }

    // Reset dan tutup modal reward
    Animated.timing(scaleReward, {
      toValue: 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web'
    }).start(() => {
      setShowReward(false);
      setConfettiActive(false);
    });
  };

  const interpolationRotation = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  const coinRotation = coinRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.root}>
      {/* ─── TOMBOL MELAYANG KOIN EMAS ─── */}
      <Animated.View style={[
        styles.floatingButtonWrap,
        {
          transform: [
            { translateY: floatAnim },
            { rotate: coinRotation }
          ]
        }
      ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={[styles.floatingButton, { backgroundColor: isDarkMode ? '#FFD700' : '#FF8C00' }]}
        >
          <MaterialCommunityIcons name="ticket-percent" size={26} color="#000" />
          <View style={styles.badgeTicket}>
            <Text style={styles.badgeTicketText}>{tickets}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ─── MODAL IMMERSIVE SPIN GAME ─── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isSpinning) setModalVisible(false);
        }}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? 'rgba(20, 20, 20, 0.98)' : 'rgba(248, 249, 250, 0.98)' }]}>
            
            {/* Background Aurora Glow */}
            <View style={styles.blurCircle1} />
            <View style={styles.blurCircle2} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <MaterialCommunityIcons name="star-circle" size={26} color="#FFD700" />
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>Keberuntungan FoodsStreets</Text>
              </View>
              <TouchableOpacity
                onPress={() => !isSpinning && setModalVisible(false)}
                disabled={isSpinning}
                style={[styles.closeBtn, { opacity: isSpinning ? 0.3 : 1 }]}
              >
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* Tiket Balance */}
            <View style={[styles.ticketCard, { backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 140, 0, 0.1)' }]}>
              <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#FF8C00" />
              <Text style={[styles.ticketLabel, { color: isDarkMode ? '#FFF' : '#333' }]}>
                Tiket Tersedia: <Text style={styles.ticketCount}>{tickets}</Text>
              </Text>
            </View>

            {/* 🎯 BOARD GAME LUCKY SPIN WHEEL 🎯 */}
            <View style={styles.gameBoard}>
              
              {/* LED Ring Border (Neon Ring Glow) */}
              <View style={[styles.wheelFrame, { borderColor: isDarkMode ? '#FFD700' : '#FF8C00' }]}>
                
                {/* 🎡 RODA SEGMENT (ANIMATED) 🎡 */}
                <Animated.View style={[
                  styles.wheelContainer,
                  {
                    transform: [{ rotate: interpolationRotation }]
                  }
                ]}>
                  <Svg width="300" height="300" viewBox="0 0 300 300">
                    <Defs>
                      <RadialGradient id="goldHub" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#FFE57F" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#FFA000" stopOpacity="1" />
                      </RadialGradient>
                    </Defs>

                    {/* Slices of Path */}
                    {REWARDS.map((reward, i) => {
                      const startAngle = i * 45;
                      const endAngle = (i + 1) * 45;
                      const radStart = (startAngle * Math.PI) / 180;
                      const radEnd = (endAngle * Math.PI) / 180;
                      
                      const R = 140;
                      const CX = 150;
                      const CY = 150;
                      
                      const x1 = CX + R * Math.cos(radStart);
                      const y1 = CY + R * Math.sin(radStart);
                      const x2 = CX + R * Math.cos(radEnd);
                      const y2 = CY + R * Math.sin(radEnd);
                      
                      const pathData = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
                      const midAngle = (i * 45) + 22.5;

                      return (
                        <G key={reward.id}>
                          {/* Segment Sector */}
                          <Path d={pathData} fill={reward.color} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                          
                          {/* Rotated Segment Label Text */}
                          <G transform={`rotate(${midAngle}, 150, 150)`}>
                            <SvgText
                              x={150 + R * 0.55}
                              y={155}
                              fill="#FFF"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              transform={`rotate(90, ${150 + R * 0.55}, 155)`}
                            >
                              {reward.emoji}
                            </SvgText>
                          </G>
                        </G>
                      );
                    })}

                    {/* Outer Gold Rim border */}
                    <Circle cx="150" cy="150" r="140" fill="transparent" stroke="#FFD700" strokeWidth="4" />
                    
                    {/* Inner gold center hub */}
                    <Circle cx="150" cy="150" r="28" fill="url(#goldHub)" stroke="#FFB300" strokeWidth="3" />
                  </Svg>

                  {/* Icon di tengah Gold Hub */}
                  <View style={styles.hubIconContainer}>
                    <MaterialCommunityIcons name="chef-hat" size={24} color="#5D4037" />
                  </View>
                </Animated.View>

                {/* 💡 LED LIGHTS RING (BLINKING) 💡 */}
                {leds.map((led) => {
                  const isOn = led.id === activeLed || (isSpinning && Math.abs(led.id - activeLed) <= 1);
                  return (
                    <View
                      key={led.id}
                      style={[
                        styles.led,
                        {
                          left: led.cx - 6,
                          top: led.cy - 6,
                          backgroundColor: isOn ? '#FFEB3B' : '#E0E0E0',
                          shadowColor: isOn ? '#FFEB3B' : 'transparent',
                          shadowOpacity: isOn ? 0.9 : 0,
                          shadowRadius: isOn ? 6 : 0,
                          transform: [{ scale: isOn ? 1.25 : 0.95 }]
                        }
                      ]}
                    />
                  );
                })}

                {/* 📐 GOLD NEEDLE POINTER 📐 */}
                <View style={styles.pointerWrap}>
                  <Svg width="40" height="40" viewBox="0 0 40 40">
                    <Path d="M 20 4 L 32 30 L 20 24 L 8 30 Z" fill="#FFC107" stroke="#FF8F00" strokeWidth="1.5" />
                    <Circle cx="20" cy="20" r="3" fill="#D84315" />
                  </Svg>
                </View>
              </View>
            </View>

            {/* Spin Button */}
            <TouchableOpacity
              onPress={spinTheWheel}
              disabled={isSpinning || tickets <= 0}
              activeOpacity={0.8}
              style={[
                styles.spinButton,
                {
                  backgroundColor: (isSpinning || tickets <= 0) ? '#B0BEC5' : '#FF8C00',
                  shadowColor: (isSpinning || tickets <= 0) ? 'transparent' : '#FF8C00'
                }
              ]}
            >
              <Text style={styles.spinButtonText}>
                {isSpinning ? 'MEMUTAR...' : tickets <= 0 ? 'TIKET HABIS' : 'PUTAR SEKARANG! 🎡'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerHint, { color: isDarkMode ? '#999' : '#666' }]}>
              Tips: Belanja menu lezat di FoodsStreets untuk menambah tiket keberuntungan Anda! 🌟
            </Text>

          </View>
        </View>
      </Modal>

      {/* ─── POPUP REWARD POPUP (SUCCESS EFFECT) ─── */}
      <Modal
        visible={showReward}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.rewardModalBg}>
          {/* Confetti particles */}
          {confettiActive && Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={`confetti-${i}`}
              delay={i * 80}
              color={REWARDS[i % REWARDS.length].color}
              x={Math.random() * (width - 40) + 20}
            />
          ))}

          <Animated.View style={[
            styles.rewardCard,
            {
              transform: [{ scale: scaleReward }],
              backgroundColor: isDarkMode ? '#222' : '#FFF'
            }
          ]}>
            <View style={styles.rewardGlow} />
            <Text style={styles.congratulationsText}>🎉 SELAMAT! 🎉</Text>
            
            <View style={[styles.rewardIconCircle, { backgroundColor: wonReward?.color || '#FF8C00' }]}>
              <Text style={styles.rewardIconText}>{wonReward?.emoji}</Text>
            </View>

            <Text style={[styles.rewardTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>{wonReward?.name}</Text>
            <Text style={[styles.rewardDescription, { color: isDarkMode ? '#CCC' : '#555' }]}>{wonReward?.description}</Text>

            {wonReward?.type === 'voucher' && (
              <View style={styles.voucherBox}>
                <Text style={styles.voucherCodeText}>{wonReward.code}</Text>
                <MaterialCommunityIcons name="content-copy" size={20} color="#FF8C00" style={{ marginLeft: 10 }} />
              </View>
            )}

            <TouchableOpacity
              onPress={handleClaimReward}
              activeOpacity={0.8}
              style={styles.claimButton}
            >
              <Text style={styles.claimButtonText}>
                {wonReward?.type === 'food' ? 'MASUKKAN KERANJANG 🛒' : 'SALIN & KLAIM HADIAH 🎁'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 9998,
  },
  floatingButtonWrap: {
    position: 'absolute',
    bottom: 80,
    left: 15,
  },
  floatingButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeTicket: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3D00',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeTicketText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    height: height * 0.75,
    alignItems: 'center',
    overflow: 'hidden',
  },
  blurCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    top: 50,
    left: -50,
  },
  blurCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 140, 0, 0.08)',
    bottom: 50,
    right: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  ticketLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ticketCount: {
    fontWeight: '900',
    color: '#FF8C00',
  },
  gameBoard: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  wheelFrame: {
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  wheelContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
  },
  hubIconContainer: {
    position: 'absolute',
    top: 138,
    left: 138,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  led: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    elevation: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  pointerWrap: {
    position: 'absolute',
    top: -12,
    zIndex: 99,
  },
  spinButton: {
    width: width * 0.75,
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 20,
  },
  spinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  footerHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 16,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 99999,
  },
  rewardModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  rewardCard: {
    width: width * 0.85,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
  },
  rewardGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    top: -50,
    zIndex: -1,
  },
  congratulationsText: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  rewardIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  rewardIconText: {
    fontSize: 48,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  voucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 0, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
  },
  voucherCodeText: {
    color: '#FF8C00',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  claimButton: {
    backgroundColor: '#FF8C00',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  }
});

export default LuckySpinWheel;
