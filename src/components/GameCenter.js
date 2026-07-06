// src/components/GameCenter.js
// Redesigned: bottom sheet setengah layar, scrollable, tree + spin wheel PNG
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useApp } from '../context/AppContext';
import SpinWheelModal from './games/SpinWheelModal';
import TreeGameModal from './games/TreeGameModal';

const { width, height } = Dimensions.get('window');
// Setengah layar sesuai permintaan
const SHEET_HEIGHT = height * 0.55;

// Gambar referensi dari assets lokal (PNG)
// PNG 1 = tanaman (tree game), PNG 2 = spin wheel
const TREE_IMAGE = require('../../assets/images/icon.png');   // ganti dengan PNG tanaman
const SPIN_IMAGE = require('../../assets/images/splash-icon.png'); // ganti dengan PNG roda

const GameCenter = () => {
  const { isDarkMode, userProfile } = useApp();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [spinVisible, setSpinVisible]   = useState(false);
  const [treeVisible, setTreeVisible]   = useState(false);
  const [activeTab, setActiveTab]       = useState('farm'); // 'farm' | 'spin'

  // Floating bubble animation
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const sheetAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(sheetAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setSheetVisible(false);
    });
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_HEIGHT, 0],
  });

  const initials = (userProfile?.name || 'ME').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const level    = 4; // TODO: bisa connect ke TreeGameModal state via context

  const bg      = isDarkMode ? '#1a1a1a' : '#fff8f4';
  const surface = isDarkMode ? '#252525' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#211a14';
  const subText = isDarkMode ? '#888'    : '#524536';
  const border  = isDarkMode ? '#333'    : '#ede0d5';

  return (
    <>
      {/* ── Floating Bubble (kiri bawah) ── */}
      <Animated.View style={[styles.bubbleWrap, { transform: [{ translateY: floatAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openSheet}
          style={[styles.bubble, { backgroundColor: isDarkMode ? '#FFD700' : '#FF8C00' }]}
        >
          <MaterialCommunityIcons name="gamepad-variant" size={24} color="#000" />
          <View style={styles.bubbleBadge}>
            <Text style={styles.bubbleBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Bottom Sheet Modal ── */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        {/* Dim overlay */}
        <TouchableOpacity style={styles.dimOverlay} activeOpacity={1} onPress={closeSheet} />

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: bg, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: border }]}>
            <View style={styles.sheetHeaderLeft}>
              <View style={[styles.headerIcon, { backgroundColor: '#815200' }]}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={20} color="#fff" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: textCol }]}>Game Center</Text>
                <Text style={[styles.headerSub, { color: subText }]}>Main &amp; Dapatkan Diskon!</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeSheet} style={[styles.closeBtn, { backgroundColor: isDarkMode ? '#333' : '#f3e6db' }]}>
              <MaterialCommunityIcons name="close" size={20} color={textCol} />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* ── MINI FARM SECTION ── */}
            <View style={styles.farmCard}>
              {/* User badge */}
              <View style={styles.userBadge}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View>
                  <Text style={styles.userBadgeName}>{userProfile?.name?.split(' ')[0] || 'Sobat Kuliner'}</Text>
                  <Text style={styles.userBadgeLevel}>LV {level} POHON BERKAH</Text>
                </View>
              </View>

              {/* XP bar */}
              <View style={styles.xpContainer}>
                <Text style={styles.xpText}>305 / 500 XP</Text>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: '61%' }]} />
                </View>
              </View>

              {/* Tree image */}
              <TouchableOpacity
                style={styles.treeImageWrap}
                onPress={() => { closeSheet(); setTimeout(() => setTreeVisible(true), 300); }}
                activeOpacity={0.9}
              >
                <Image source={TREE_IMAGE} style={styles.treeImage} resizeMode="contain" />
                <Text style={styles.treeHint}>Ketuk untuk bermain →</Text>
              </TouchableOpacity>

              {/* Action buttons */}
              <View style={styles.farmActions}>
                <TouchableOpacity
                  style={[styles.farmBtn, { backgroundColor: '#007dae' }]}
                  onPress={() => { closeSheet(); setTimeout(() => setTreeVisible(true), 300); }}
                >
                  <MaterialCommunityIcons name="water" size={22} color="#fff" />
                  <Text style={styles.farmBtnLabel}>Siram</Text>
                  <Text style={styles.farmBtnSub}>5/5</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.farmBtn, { backgroundColor: '#815200' }]}
                  onPress={() => { closeSheet(); setTimeout(() => setTreeVisible(true), 300); }}
                >
                  <MaterialCommunityIcons name="format-list-checks" size={22} color="#fff" />
                  <Text style={styles.farmBtnLabel}>Misi</Text>
                  <Text style={styles.farmBtnSub}>XP</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.farmBtn, { backgroundColor: '#2d5a27' }]}
                  onPress={() => { closeSheet(); setTimeout(() => setTreeVisible(true), 300); }}
                >
                  <MaterialCommunityIcons name="leaf" size={22} color="#fff" />
                  <Text style={styles.farmBtnLabel}>Pupuk</Text>
                  <Text style={styles.farmBtnSub}>1/2</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── LUCKY SPIN SECTION ── */}
            <View style={styles.spinSection}>
              <Text style={[styles.spinTitle, { color: textCol }]}>Lucky Spin Gacha</Text>
              <Text style={[styles.spinSub, { color: subText }]}>Putar &amp; Menangkan Hadiah Menarik!</Text>

              {/* Spin wheel image — setengah lingkaran */}
              <TouchableOpacity
                style={styles.spinWheelWrap}
                onPress={() => { closeSheet(); setTimeout(() => setSpinVisible(true), 300); }}
                activeOpacity={0.88}
              >
                {/* Outer ring */}
                <View style={[styles.spinRing, { borderColor: '#815200' }]}>
                  {/* Wheel image */}
                  <Image source={SPIN_IMAGE} style={styles.spinWheelImage} resizeMode="contain" />
                  {/* Pointer */}
                  <View style={styles.spinPointer}>
                    <View style={styles.spinPointerTriangle} />
                  </View>
                </View>
                {/* Spin CTA */}
                <TouchableOpacity
                  style={styles.spinCTA}
                  onPress={() => { closeSheet(); setTimeout(() => setSpinVisible(true), 300); }}
                >
                  <Text style={styles.spinCTAText}>PUTAR</Text>
                  <Text style={styles.spinCTAFree}>FREE</Text>
                </TouchableOpacity>
                {/* Ticket count */}
                <View style={[styles.ticketBadge, { backgroundColor: isDarkMode ? '#333' : '#fff1e5' }]}>
                  <MaterialCommunityIcons name="ticket-confirmation" size={14} color="#815200" />
                  <Text style={[styles.ticketText, { color: '#815200' }]}>Kesempatan: <Text style={{ fontWeight: '900' }}>3</Text></Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* ── Sub-modals game ── */}
      {spinVisible && <SpinWheelModal visible={spinVisible} onClose={() => setSpinVisible(false)} />}
      {treeVisible && <TreeGameModal  visible={treeVisible} onClose={() => setTreeVisible(false)} />}
    </>
  );
};

const styles = StyleSheet.create({
  // Floating bubble
  bubbleWrap: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    zIndex: 9998,
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bubbleBadge: {
    position: 'absolute',
    top: -2, right: -2,
    backgroundColor: '#FF3D00',
    borderRadius: 8,
    width: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#fff',
  },
  bubbleBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  // Overlay
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40, height: 5,
    backgroundColor: 'rgba(130,81,0,0.25)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sheetHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSub:   { fontSize: 11, marginTop: 1 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  // Farm card
  farmCard: {
    backgroundColor: '#1e3c1a',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  userBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#ffb95c',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText:       { color: '#2a1700', fontSize: 10, fontWeight: '900' },
  userBadgeName:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  userBadgeLevel:   { color: '#ffb95c', fontSize: 9, letterSpacing: 0.5 },

  // XP
  xpContainer: { marginBottom: 12 },
  xpText:      { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  xpBarBg: {
    height: 10, backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 5, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  xpBarFill: {
    height: '100%', borderRadius: 5,
    backgroundColor: '#ffb95c',
    shadowColor: '#ffb95c', shadowOpacity: 0.6, shadowRadius: 4,
  },

  // Tree image
  treeImageWrap: { alignItems: 'center', marginVertical: 8 },
  treeImage:     { width: 120, height: 120 },
  treeHint:      { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },

  // Farm action buttons
  farmActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  farmBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: 16, gap: 2,
    borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.25)',
  },
  farmBtnLabel: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  farmBtnSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 10 },

  // Spin section
  spinSection:  { alignItems: 'center' },
  spinTitle:    { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  spinSub:      { fontSize: 12, marginBottom: 16 },
  spinWheelWrap:{ alignItems: 'center', width: '100%' },
  spinRing: {
    width: width * 0.65,
    height: (width * 0.65) / 2,
    borderTopLeftRadius: width * 0.65 / 2,
    borderTopRightRadius: width * 0.65 / 2,
    borderWidth: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#fff1e5',
    shadowColor: '#ffb95c',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  spinWheelImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  spinPointer: {
    position: 'absolute', top: -12,
    alignItems: 'center', zIndex: 10,
  },
  spinPointerTriangle: {
    width: 0, height: 0,
    borderLeftWidth: 12, borderLeftColor: 'transparent',
    borderRightWidth: 12, borderRightColor: 'transparent',
    borderTopWidth: 22, borderTopColor: '#ba1a1a',
  },
  spinCTA: {
    marginTop: -20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#815200',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#fff',
    elevation: 10,
    shadowColor: '#ffb95c', shadowOpacity: 0.5, shadowRadius: 10,
    zIndex: 20,
  },
  spinCTAText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  spinCTAFree: { color: 'rgba(255,255,255,0.7)', fontSize: 9 },
  ticketBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#ffb95c55',
  },
  ticketText: { fontSize: 12, fontWeight: '600' },
});

export default GameCenter;
