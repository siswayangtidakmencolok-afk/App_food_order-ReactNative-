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

export default SpinWheelModal;
