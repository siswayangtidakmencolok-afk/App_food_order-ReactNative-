import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Clipboard, Dimensions, Easing, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useApp } from '../../context/AppContext';
import ConfettiParticle from './ConfettiParticle';

const { width, height } = Dimensions.get('window');

// ─── DAFTAR HADIAH PREMIUM ───
const REWARDS = [
  { id: 0, name: 'Nasi Goreng Spesial gratis! 🍛', type: 'food', dbName: 'Nasi Goreng Spesial', color: '#FF6B6B', emoji: '🍛', description: 'Nasi goreng lezat dengan telur dan ayam suwir otomatis ditambahkan ke keranjang!' },
  { id: 1, name: 'Diskon 50% Seluruh Menu! 💸', type: 'voucher', code: 'FS50GOLD', color: '#4D96FF', emoji: '💸', description: 'Dapatkan diskon 50% tanpa minimum pembelian! Kode promo disalin ke clipboard.' },
  { id: 2, name: 'Es Teh Manis gratis! 🍹', type: 'food', dbName: 'Es Teh Manis', color: '#6BCB77', emoji: '🍹', description: 'Segarnya es teh manis gratis! Otomatis ditambahkan ke keranjang belanja Anda.' },
  { id: 3, name: 'Voucher Rp 10.000! 💵', type: 'voucher', code: 'FS10KDISC', color: '#FFD93D', emoji: '💵', description: 'Potongan langsung Rp 10.000 untuk pembelian berikutnya.' },
  { id: 4, name: 'Gratis Ongkir Instan! 🛵', type: 'voucher', code: 'FSFREEONGKIR', color: '#FF9F29', emoji: '🛵', description: 'Gak perlu bayar ongkir ke mana pun!' },
  { id: 5, name: 'Zonk! Coba Lagi Besok 😢', type: 'zonk', color: '#B983FF', emoji: '😢', description: 'Wah, sayang sekali. Tetap semangat dan coba lagi besok ya!' },
  { id: 6, name: 'Mie Goreng Spesial gratis! 🍜', type: 'food', dbName: 'Mie Goreng', color: '#38E54D', emoji: '🍜', description: 'Mie goreng pedas gurih gratis! Otomatis ditambahkan ke keranjang.' },
  { id: 7, name: 'Kopi Susu Aren gratis! ☕', type: 'food', dbName: 'Kopi Susu Gula Aren', color: '#FF6FB5', emoji: '☕', description: 'Kopi susu gula aren best-seller gratis!' }
];

// ─── SVG Wheel yang lebih premium dengan gradient & divider garis ───
const WheelSVG = ({ size = 300 }) => {
  const CX = size / 2, CY = size / 2, R = size / 2 - 8;
  const segCount = REWARDS.length;
  const angleStep = (2 * Math.PI) / segCount;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="hubGold" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="40%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FF8F00" />
        </RadialGradient>
        <RadialGradient id="outerRing" cx="50%" cy="50%" r="50%">
          <Stop offset="85%" stopColor="#B8860B" stopOpacity="0" />
          <Stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Outer decorative ring */}
      <Circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="#FFD700" strokeWidth="3" opacity="0.6" />
      <Circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="#FF8C00" strokeWidth="1.5" opacity="0.4" />

      {/* Wheel segments */}
      {REWARDS.map((reward, i) => {
        const startAngle = i * angleStep - Math.PI / 2;
        const endAngle   = (i + 1) * angleStep - Math.PI / 2;
        const x1 = CX + R * Math.cos(startAngle);
        const y1 = CY + R * Math.sin(startAngle);
        const x2 = CX + R * Math.cos(endAngle);
        const y2 = CY + R * Math.sin(endAngle);
        const pathData = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;

        // Emoji position
        const midAngle   = startAngle + angleStep / 2;
        const emojiR     = R * 0.62;
        const ex         = CX + emojiR * Math.cos(midAngle);
        const ey         = CY + emojiR * Math.sin(midAngle);
        const rotateDeg  = (midAngle * 180) / Math.PI + 90;

        // Alternating shade for depth
        const shadedColor = i % 2 === 0 ? reward.color : reward.color + 'CC';

        return (
          <G key={reward.id}>
            <Path
              d={pathData}
              fill={shadedColor}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1.5"
            />
            {/* Divider line from center */}
            <Line
              x1={CX} y1={CY}
              x2={x1} y2={y1}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
            {/* Emoji label */}
            <G transform={`translate(${ex}, ${ey}) rotate(${rotateDeg})`}>
              <SvgText
                x="0" y="0"
                fontSize={size * 0.07}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFF"
                fontWeight="bold"
              >
                {reward.emoji}
              </SvgText>
            </G>
          </G>
        );
      })}

      {/* Inner circle border */}
      <Circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

      {/* Center hub */}
      <Circle cx={CX} cy={CY} r={size * 0.1} fill="url(#hubGold)" stroke="#FF8F00" strokeWidth="3" />
      <SvgText
        x={CX} y={CY + 1}
        fontSize={size * 0.075}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#5D4037"
      >
        👨‍🍳
      </SvgText>
    </Svg>
  );
};

const WHEEL_SIZE = Math.min(width * 0.72, 300);

const SpinWheelModal = ({ visible, onClose }) => {
  const { menuItems, addToCart, addNotification, isDarkMode } = useApp();
  
  const [tickets, setTickets]           = useState(3);
  const [isSpinning, setIsSpinning]     = useState(false);
  const [activeLed, setActiveLed]       = useState(0);
  const [showReward, setShowReward]     = useState(false);
  const [wonReward, setWonReward]       = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const scaleReward   = useRef(new Animated.Value(0)).current;
  const glowAnim      = useRef(new Animated.Value(0.6)).current;

  // LED positions around the wheel
  const LED_COUNT = 16;
  const LED_RADIUS = WHEEL_SIZE / 2 + 18;
  const leds = Array.from({ length: LED_COUNT }).map((_, i) => {
    const angle = (i * (2 * Math.PI)) / LED_COUNT;
    return {
      id: i,
      x: WHEEL_SIZE / 2 + LED_RADIUS * Math.cos(angle - Math.PI / 2),
      y: WHEEL_SIZE / 2 + LED_RADIUS * Math.sin(angle - Math.PI / 2),
    };
  });

  // Glow pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const speed = isSpinning ? 50 : 900;
    const timer = setInterval(() => setActiveLed(p => (p + 1) % LED_COUNT), speed);
    return () => clearInterval(timer);
  }, [isSpinning]);

  const spinTheWheel = () => {
    if (isSpinning || tickets <= 0) return;

    setIsSpinning(true);
    setTickets(prev => prev - 1);
    setShowReward(false);
    setConfettiActive(false);

    const rand = Math.random();
    let wonIndex = 5;
    if      (rand < 0.12) wonIndex = 0;
    else if (rand < 0.22) wonIndex = 1;
    else if (rand < 0.38) wonIndex = 2;
    else if (rand < 0.48) wonIndex = 3;
    else if (rand < 0.60) wonIndex = 4;
    else if (rand < 0.70) wonIndex = 6;
    else if (rand < 0.82) wonIndex = 7;
    else wonIndex = 5;

    const targetReward = REWARDS[wonIndex];
    setWonReward(targetReward);

    // 8 segment × 45° each. Pointer at top (270°). Segment center = wonIndex*45 + 22.5
    const segCenter = wonIndex * 45 + 22.5;
    const targetDeg = 6 * 360 + (270 - segCenter);

    wheelRotation.setValue(0);
    Animated.timing(wheelRotation, {
      toValue: targetDeg,
      duration: 5200,
      easing: Easing.bezier(0.12, 0.9, 0.2, 1.0),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIsSpinning(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          targetReward.type !== 'zonk'
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );
      }
      setShowReward(true);
      if (targetReward.type !== 'zonk') setConfettiActive(true);
      Animated.spring(scaleReward, { toValue: 1, friction: 5, tension: 80, useNativeDriver: Platform.OS !== 'web' }).start();
    });

    // Haptic tick (native only)
    if (Platform.OS !== 'web') {
      let tick = 0;
      const triggerTick = () => {
        if (tick < 35) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          tick++;
          setTimeout(triggerTick, 100 + Math.pow(tick / 35, 3) * 600);
        }
      };
      setTimeout(triggerTick, 150);
    }
  };

  const handleClaimReward = () => {
    if (!wonReward) return;
    if (wonReward.type === 'food') {
      let item = menuItems.find(m => m.name.toLowerCase() === wonReward.dbName.toLowerCase());
      if (!item) {
        const fallback = [
          { id: 1, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
          { id: 2, name: 'Mie Goreng', price: 20000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
          { id: 4, name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
          { id: 14, name: 'Kopi Susu Gula Aren', price: 15000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400' },
        ];
        item = fallback.find(m => m.name.toLowerCase() === wonReward.dbName.toLowerCase());
      }
      if (item) {
        addToCart({ ...item, price: 0 });
        addNotification(`🎁 ${wonReward.dbName} gratis ditambahkan ke keranjang!`, 'success');
      }
    } else if (wonReward.type === 'voucher') {
      Clipboard.setString(wonReward.code);
      addNotification(`🎫 Kode ${wonReward.code} disalin!`, 'success');
    }
    Animated.timing(scaleReward, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      setShowReward(false);
      setConfettiActive(false);
    });
  };

  const rotateInterp = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const bg = isDarkMode ? '#141414' : '#1a1200';

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => !isSpinning && onClose()}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: bg }]}>
            {/* Ambient blobs */}
            <View style={[styles.blob1]} />
            <View style={[styles.blob2]} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="star-circle" size={24} color="#FFD700" />
                <Text style={styles.headerTitle}>Keberuntungan FoodsStreets</Text>
              </View>
              <TouchableOpacity
                onPress={() => !isSpinning && onClose()}
                disabled={isSpinning}
                style={[styles.closeBtn, { opacity: isSpinning ? 0.3 : 1 }]}
              >
                <MaterialCommunityIcons name="close" size={22} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* Ticket badge */}
            <View style={styles.ticketBadge}>
              <MaterialCommunityIcons name="ticket-confirmation" size={18} color="#FF8C00" />
              <Text style={styles.ticketText}>
                Tiket Tersedia: <Text style={styles.ticketNum}>{tickets}</Text>
              </Text>
            </View>

            {/* Wheel area */}
            <View style={styles.wheelOuter}>
              {/* Glow ring */}
              <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />

              {/* LED ring */}
              <View style={[styles.ledContainer, { width: WHEEL_SIZE + 50, height: WHEEL_SIZE + 50 }]}>
                {leds.map(led => {
                  const on = led.id === activeLed ||
                    (isSpinning && (Math.abs(led.id - activeLed) <= 2 || Math.abs(led.id - activeLed) >= LED_COUNT - 2));
                  return (
                    <View
                      key={led.id}
                      style={[
                        styles.led,
                        {
                          left:  led.x + 25 - 6,
                          top:   led.y + 25 - 6,
                          backgroundColor: on ? '#FFD700' : '#3a2800',
                          shadowColor: on ? '#FFD700' : 'transparent',
                          shadowOpacity: on ? 1 : 0,
                          shadowRadius: on ? 8 : 0,
                          transform: [{ scale: on ? 1.3 : 1 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* The spinning wheel */}
              <Animated.View style={[styles.wheelWrap, { transform: [{ rotate: rotateInterp }] }]}>
                <WheelSVG size={WHEEL_SIZE} />
              </Animated.View>

              {/* Pointer */}
              <View style={styles.pointerWrap}>
                <Svg width="32" height="44" viewBox="0 0 32 44">
                  <Path d="M16 2 L30 38 L16 30 L2 38 Z" fill="#FFC107" stroke="#FF6F00" strokeWidth="2" />
                  <Circle cx="16" cy="22" r="5" fill="#D84315" />
                </Svg>
              </View>
            </View>

            {/* Spin button */}
            <TouchableOpacity
              onPress={spinTheWheel}
              disabled={isSpinning || tickets <= 0}
              activeOpacity={0.85}
              style={[
                styles.spinBtn,
                (isSpinning || tickets <= 0) && styles.spinBtnDisabled,
              ]}
            >
              <Text style={styles.spinBtnText}>
                {isSpinning ? '🎡 MEMUTAR...' : tickets <= 0 ? '🎫 TIKET HABIS' : 'PUTAR SEKARANG! 🎡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reward modal */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={styles.rewardBg}>
          {confettiActive && Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 80} color={REWARDS[i % REWARDS.length].color} x={Math.random() * (width - 40) + 20} />
          ))}
          <Animated.View style={[styles.rewardCard, { transform: [{ scale: scaleReward }], backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
            <View style={[styles.rewardGlow, { backgroundColor: wonReward?.color + '30' }]} />
            <Text style={styles.congratsText}>🎉 SELAMAT! 🎉</Text>
            <View style={[styles.rewardIconCircle, { backgroundColor: wonReward?.color }]}>
              <Text style={styles.rewardEmoji}>{wonReward?.emoji}</Text>
            </View>
            <Text style={[styles.rewardName, { color: isDarkMode ? '#fff' : '#1a1a1a' }]}>{wonReward?.name}</Text>
            <Text style={[styles.rewardDesc, { color: isDarkMode ? '#bbb' : '#555' }]}>{wonReward?.description}</Text>
            {wonReward?.type === 'voucher' && (
              <View style={styles.voucherBox}>
                <Text style={styles.voucherCode}>{wonReward.code}</Text>
                <MaterialCommunityIcons name="content-copy" size={18} color="#FF8C00" />
              </View>
            )}
            <TouchableOpacity onPress={handleClaimReward} style={styles.claimBtn}>
              <Text style={styles.claimBtnText}>
                {wonReward?.type === 'food' ? 'MASUKKAN KERANJANG 🛒' : 'SALIN & KLAIM 🎁'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

// ─── DAFTAR HADIAH PREMIUM ───
const REWARDS = [
  { id: 0, name: 'Nasi Goreng Spesial gratis! 🍛', type: 'food', dbName: 'Nasi Goreng Spesial', color: '#FF6B6B', emoji: '🍛', description: 'Nasi goreng lezat dengan telur dan ayam suwir otomatis ditambahkan ke keranjang!' },
  { id: 1, name: 'Diskon 50% Seluruh Menu! 💸', type: 'voucher', code: 'FS50GOLD', color: '#4D96FF', emoji: '💸', description: 'Dapatkan diskon 50% tanpa minimum pembelian! Kode promo disalin ke clipboard.' },
  { id: 2, name: 'Es Teh Manis gratis! 🍹', type: 'food', dbName: 'Es Teh Manis', color: '#6BCB77', emoji: '🍹', description: 'Segarnya es teh manis manis gratis! Otomatis ditambahkan ke keranjang belanja Anda.' },
  { id: 3, name: 'Voucher Rp 10.000! 💵', type: 'voucher', code: 'FS10KDISC', color: '#FFD93D', emoji: '💵', description: 'Potongan langsung Rp 10.000 untuk pembelian berikutnya. Kode promo disalin ke clipboard.' },
  { id: 4, name: 'Gratis Ongkir Instan! 🛵', type: 'voucher', code: 'FSFREEONGKIR', color: '#FF9F29', emoji: '🛵', description: 'Gak perlu bayar ongkir ke mana pun! Kode promo otomatis disalin ke clipboard Anda.' },
  { id: 5, name: 'Zonk! Coba Lagi Besok 😢', type: 'zonk', color: '#B983FF', emoji: '😢', description: 'Wah, sayang sekali keberuntungan Anda sedang beristirahat. Tetap semangat dan coba lagi besok ya!' },
  { id: 6, name: 'Mie Goreng Spesial gratis! 🍜', type: 'food', dbName: 'Mie Goreng', color: '#38E54D', emoji: '🍜', description: 'Mie goreng pedas gurih dengan telur gratis! Otomatis ditambahkan ke keranjang belanja Anda.' },
  { id: 7, name: 'Kopi Susu Aren gratis! ☕', type: 'food', dbName: 'Kopi Susu Gula Aren', color: '#FF6FB5', emoji: '☕', description: 'Kopi susu gula aren best-seller gratis! Otomatis ditambahkan ke keranjang belanja Anda.' }
];

const SpinWheelModal = ({ visible, onClose }) => {
  const { menuItems, addToCart, addNotification, isDarkMode } = useApp();
  
  const [tickets, setTickets] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeLed, setActiveLed] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const scaleReward = useRef(new Animated.Value(0)).current;

  // 12 LED Koordinat sirkuler (radius: 146)
  const leds = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const cx = 150 + 143 * Math.cos(angle);
    const cy = 150 + 143 * Math.sin(angle);
    return { id: i, cx, cy };
  });

  useEffect(() => {
    let ledTimer;
    if (isSpinning) {
      ledTimer = setInterval(() => setActiveLed(prev => (prev + 1) % 12), 60);
    } else {
      ledTimer = setInterval(() => setActiveLed(prev => (prev + 1) % 12), 1000);
    }
    return () => clearInterval(ledTimer);
  }, [isSpinning]);

  const spinTheWheel = () => {
    if (isSpinning || tickets <= 0) return;

    setIsSpinning(true);
    setTickets(prev => prev - 1);
    setShowReward(false);
    setConfettiActive(false);

    const rand = Math.random();
    let wonIndex = 5; // default Zonk
    if (rand < 0.12) wonIndex = 0;
    else if (rand < 0.22) wonIndex = 1;
    else if (rand < 0.38) wonIndex = 2;
    else if (rand < 0.48) wonIndex = 3;
    else if (rand < 0.60) wonIndex = 4;
    else if (rand < 0.70) wonIndex = 6;
    else if (rand < 0.82) wonIndex = 7;
    else wonIndex = 5;

    const targetReward = REWARDS[wonIndex];
    setWonReward(targetReward);

    const extraSpins = 6;
    const targetDeg = (extraSpins * 360) + (270 - (wonIndex * 45 + 22.5));

    wheelRotation.setValue(0);
    Animated.timing(wheelRotation, {
      toValue: targetDeg,
      duration: 5000,
      easing: Easing.bezier(0.15, 0.9, 0.25, 1.0),
      useNativeDriver: Platform.OS !== 'web'
    }).start(() => {
      setIsSpinning(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          targetReward.type !== 'zonk' 
            ? Haptics.NotificationFeedbackType.Success 
            : Haptics.NotificationFeedbackType.Warning
        );
      }

      setShowReward(true);
      if (targetReward.type !== 'zonk') setConfettiActive(true);

      Animated.spring(scaleReward, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web'
      }).start();
    });

    if (Platform.OS !== 'web') {
      let tickCount = 0;
      const totalTicks = 35;
      const triggerTick = () => {
        if (tickCount < totalTicks) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          tickCount++;
          const delay = 100 + Math.pow(tickCount / totalTicks, 3) * 600;
          setTimeout(triggerTick, delay);
        }
      };
      setTimeout(triggerTick, 150);
    }
  };

  const handleClaimReward = () => {
    if (!wonReward) return;

    if (wonReward.type === 'food') {
      let targetItem = menuItems.find(item => item.name.toLowerCase() === wonReward.dbName.toLowerCase());
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
        addToCart({ ...targetItem, price: 0 });
        addNotification(`🎁 Selamat! ${wonReward.dbName} gratis telah ditambahkan ke keranjang Anda!`, 'success');
      }
    } else if (wonReward.type === 'voucher') {
      Clipboard.setString(wonReward.code);
      addNotification(`🎫 Kode Voucher ${wonReward.code} berhasil disalin!`, 'success');
    }

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

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => !isSpinning && onClose()}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? 'rgba(20, 20, 20, 0.98)' : 'rgba(248, 249, 250, 0.98)' }]}>
            <View style={styles.blurCircle1} />
            <View style={styles.blurCircle2} />

            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <MaterialCommunityIcons name="star-circle" size={26} color="#FFD700" />
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>Keberuntungan FoodsStreets</Text>
              </View>
              <TouchableOpacity onPress={() => !isSpinning && onClose()} disabled={isSpinning} style={[styles.closeBtn, { opacity: isSpinning ? 0.3 : 1 }]}>
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.ticketCard, { backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 140, 0, 0.1)' }]}>
              <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#FF8C00" />
              <Text style={[styles.ticketLabel, { color: isDarkMode ? '#FFF' : '#333' }]}>
                Tiket Tersedia: <Text style={styles.ticketCount}>{tickets}</Text>
              </Text>
            </View>

            <View style={styles.gameBoard}>
              <View style={[styles.wheelFrame, { borderColor: isDarkMode ? '#FFD700' : '#FF8C00' }]}>
                <Animated.View style={[styles.wheelContainer, { transform: [{ rotate: interpolationRotation }] }]}>
                  <Svg width="300" height="300" viewBox="0 0 300 300">
                    <Defs>
                      <RadialGradient id="goldHub" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                        <Stop offset="50%" stopColor="#FFE57F" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#FFA000" stopOpacity="1" />
                      </RadialGradient>
                    </Defs>
                    {REWARDS.map((reward, i) => {
                      const startAngle = i * 45;
                      const endAngle = (i + 1) * 45;
                      const radStart = (startAngle * Math.PI) / 180;
                      const radEnd = (endAngle * Math.PI) / 180;
                      const R = 140, CX = 150, CY = 150;
                      const x1 = CX + R * Math.cos(radStart), y1 = CY + R * Math.sin(radStart);
                      const x2 = CX + R * Math.cos(radEnd), y2 = CY + R * Math.sin(radEnd);
                      const pathData = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
                      const midAngle = (i * 45) + 22.5;

                      return (
                        <G key={reward.id}>
                          <Path d={pathData} fill={reward.color} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                          <G transform={`rotate(${midAngle}, 150, 150)`}>
                            <SvgText x={150 + R * 0.55} y={155} fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle" transform={`rotate(90, ${150 + R * 0.55}, 155)`}>
                              {reward.emoji}
                            </SvgText>
                          </G>
                        </G>
                      );
                    })}
                    <Circle cx="150" cy="150" r="140" fill="transparent" stroke="#FFD700" strokeWidth="4" />
                    <Circle cx="150" cy="150" r="28" fill="url(#goldHub)" stroke="#FFB300" strokeWidth="3" />
                  </Svg>
                  <View style={styles.hubIconContainer}>
                    <MaterialCommunityIcons name="chef-hat" size={24} color="#5D4037" />
                  </View>
                </Animated.View>

                {leds.map((led) => {
                  const isOn = led.id === activeLed || (isSpinning && Math.abs(led.id - activeLed) <= 1);
                  return (
                    <View key={led.id} style={[styles.led, { left: led.cx - 6, top: led.cy - 6, backgroundColor: isOn ? '#FFEB3B' : '#E0E0E0', shadowColor: isOn ? '#FFEB3B' : 'transparent', shadowOpacity: isOn ? 0.9 : 0, shadowRadius: isOn ? 6 : 0, transform: [{ scale: isOn ? 1.25 : 0.95 }] }]} />
                  );
                })}

                <View style={styles.pointerWrap}>
                  <Svg width="40" height="40" viewBox="0 0 40 40">
                    <Path d="M 20 4 L 32 30 L 20 24 L 8 30 Z" fill="#FFC107" stroke="#FF8F00" strokeWidth="1.5" />
                    <Circle cx="20" cy="20" r="3" fill="#D84315" />
                  </Svg>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={spinTheWheel} disabled={isSpinning || tickets <= 0} activeOpacity={0.8} style={[styles.spinButton, { backgroundColor: (isSpinning || tickets <= 0) ? '#B0BEC5' : '#FF8C00' }]}>
              <Text style={styles.spinButtonText}>
                {isSpinning ? 'MEMUTAR...' : tickets <= 0 ? 'TIKET HABIS' : 'PUTAR SEKARANG! 🎡'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showReward} transparent={true} animationType="fade">
        <View style={styles.rewardModalBg}>
          {confettiActive && Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={`confetti-${i}`} delay={i * 80} color={REWARDS[i % REWARDS.length].color} x={Math.random() * (width - 40) + 20} />
          ))}
          <Animated.View style={[styles.rewardCard, { transform: [{ scale: scaleReward }], backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
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
            <TouchableOpacity onPress={handleClaimReward} activeOpacity={0.8} style={styles.claimButton}>
              <Text style={styles.claimButtonText}>{wonReward?.type === 'food' ? 'MASUKKAN KERANJANG 🛒' : 'SALIN & KLAIM HADIAH 🎁'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBg:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
    alignItems: 'center', overflow: 'hidden',
    minHeight: height * 0.72,
  },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,215,0,0.07)', top: 30, left: -60 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,140,0,0.06)', bottom: 40, right: -50 },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:{ color: '#fff', fontSize: 15, fontWeight: '900' },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },

  ticketBadge:{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,140,0,0.12)', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,140,0,0.3)' },
  ticketText: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  ticketNum:  { color: '#FF8C00', fontWeight: '900', fontSize: 15 },

  wheelOuter: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  glowRing:   {
    position: 'absolute',
    width: WHEEL_SIZE + 70, height: WHEEL_SIZE + 70,
    borderRadius: (WHEEL_SIZE + 70) / 2,
    backgroundColor: 'transparent',
    borderWidth: 2, borderColor: '#FFD700',
    shadowColor: '#FFD700', shadowOpacity: 0.8, shadowRadius: 20, elevation: 10,
  },
  ledContainer: { position: 'absolute' },
  led:        { position: 'absolute', width: 12, height: 12, borderRadius: 6, elevation: 4, shadowOffset: { width: 0, height: 0 } },
  wheelWrap:  { width: WHEEL_SIZE, height: WHEEL_SIZE },
  pointerWrap:{ position: 'absolute', top: -8, zIndex: 20 },

  spinBtn: {
    width: width * 0.8, paddingVertical: 16,
    borderRadius: 30, alignItems: 'center',
    backgroundColor: '#FF8C00',
    elevation: 8,
    shadowColor: '#FF8C00', shadowOpacity: 0.5, shadowRadius: 12,
  },
  spinBtnDisabled: { backgroundColor: '#555' },
  spinBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Reward
  rewardBg:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  rewardCard: { width: width * 0.86, borderRadius: 28, padding: 24, alignItems: 'center', elevation: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', overflow: 'hidden' },
  rewardGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -60, zIndex: -1 },
  congratsText:   { color: '#FFD700', fontSize: 22, fontWeight: '900', letterSpacing: 2, marginBottom: 16 },
  rewardIconCircle:{ width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', elevation: 4 },
  rewardEmoji:    { fontSize: 44 },
  rewardName:     { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  rewardDesc:     { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 18, paddingHorizontal: 8 },
  voucherBox:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,140,0,0.12)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, marginBottom: 18, borderWidth: 1.5, borderColor: '#FF8C00', borderStyle: 'dashed' },
  voucherCode:    { color: '#FF8C00', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 },
  claimBtn:       { backgroundColor: '#FF8C00', width: '100%', paddingVertical: 14, borderRadius: 18, alignItems: 'center', elevation: 4 },
  claimBtnText:   { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
});

export default SpinWheelModal;
