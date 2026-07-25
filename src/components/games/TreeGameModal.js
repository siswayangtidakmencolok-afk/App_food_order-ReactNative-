import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useEffect, useRef, useState } from 'react';
import {
    Animated, Clipboard, Dimensions, Modal, Platform,
    ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { useApp } from '../../context/AppContext';
import ConfettiParticle from './ConfettiParticle';

const { width, height } = Dimensions.get('window');
const MAX_LEVEL = 5;
const XP_THRESHOLDS = [0, 50, 150, 300, 500];

const MISSIONS = [
  { id: 'DAILY_LOGIN',   title: 'Login Harian',           xp: 20, icon: 'calendar-check', link: null },
  { id: 'BUY_MIN_25K',   title: 'Belanja Min. Rp 25.000', xp: 40, icon: 'cart-check',     link: null },
  { id: 'FOLLOW_IG',     title: 'Follow Instagram',        xp: 25, icon: 'instagram',      link: 'https://www.instagram.com/f.zvvn_/' },
  { id: 'FOLLOW_TIKTOK', title: 'Follow TikTok',           xp: 25, icon: 'music-note',     link: 'https://www.tiktok.com/@eksrovertselalu' },
  { id: 'JOIN_DISCORD',  title: 'Join Discord',            xp: 25, icon: 'chat',            link: 'https://discord.com/channels/@zxyninety' },
  { id: 'VISIT_FRIEREN', title: 'Kunjungi Web Frieren',    xp: 30, icon: 'web',             link: 'https://siswayangtidakmencolok-afk.github.io/website-frieren/' },
  { id: 'VISIT_3D',      title: 'Lihat 3D Global',         xp: 30, icon: 'earth',           link: 'https://globe3d-byfhaz.netlify.app/' },
];

const REWARDS = [
  { type: 'voucher', name: 'Diskon 30%',         code: 'FS30TREE',     color: '#4D96FF', emoji: '🎫', description: 'Diskon 30% berkat panen pohon!' },
  { type: 'voucher', name: 'Gratis Ongkir',       code: 'FSTREEONGKIR', color: '#FF9F29', emoji: '🛵', description: 'Gratis ongkir untuk pesanan Anda!' },
  { type: 'voucher', name: 'Potongan Rp 15.000',  code: 'FSTREE15K',    color: '#FFD93D', emoji: '💵', description: 'Potongan langsung Rp 15.000.' },
  { type: 'food',    name: 'Ayam Goreng Kriuk',   dbName: 'Ayam Goreng', color: '#FF6B6B', emoji: '🍗', description: 'Ayam Goreng gratis ditambahkan ke keranjang!' },
];

// ── Illustrated plant SVG per level ──────────────────────────────
const PlantSVG = ({ level, size = 200, waterAnim }) => {
  const cx = size / 2;
  const potH = size * 0.28, potW = size * 0.44, potTop = size * 0.52;
  const potX = cx - potW / 2;
  const stemHeights = [0, size * 0.08, size * 0.15, size * 0.22, size * 0.28, size * 0.3];
  const stemH = stemHeights[Math.min(level, 5)];
  const stemY0 = potTop - stemH;
  const leafConfigs = {
    1: [],
    2: [{ x: cx-10, y: stemY0+4, r: 14, angle: -40, color: '#6BCB77' }, { x: cx+10, y: stemY0+4, r: 14, angle: 40, color: '#52B96A' }],
    3: [{ x: cx-16, y: stemY0+2, r: 20, angle: -50, color: '#4CAF50' }, { x: cx+16, y: stemY0+2, r: 20, angle: 50, color: '#43A047' }, { x: cx-8, y: stemY0-8, r: 16, angle: -30, color: '#66BB6A' }, { x: cx+8, y: stemY0-8, r: 16, angle: 30, color: '#4CAF50' }],
    4: [{ x: cx-24, y: stemY0+4, r: 28, angle: -60, color: '#2E7D32' }, { x: cx+24, y: stemY0+4, r: 28, angle: 60, color: '#388E3C' }, { x: cx-16, y: stemY0-4, r: 22, angle: -40, color: '#43A047' }, { x: cx+16, y: stemY0-4, r: 22, angle: 40, color: '#388E3C' }, { x: cx-8, y: stemY0-14, r: 18, angle: -20, color: '#4CAF50' }, { x: cx+8, y: stemY0-14, r: 18, angle: 20, color: '#4CAF50' }],
    5: [{ x: cx-30, y: stemY0+8, r: 34, angle: -65, color: '#1B5E20' }, { x: cx+30, y: stemY0+8, r: 34, angle: 65, color: '#2E7D32' }, { x: cx-20, y: stemY0-2, r: 28, angle: -45, color: '#388E3C' }, { x: cx+20, y: stemY0-2, r: 28, angle: 45, color: '#2E7D32' }, { x: cx-10, y: stemY0-14, r: 22, angle: -25, color: '#43A047' }, { x: cx+10, y: stemY0-14, r: 22, angle: 25, color: '#43A047' }, { x: cx, y: stemY0-22, r: 18, angle: 0, color: '#4CAF50' }],
  };
  const leaves = leafConfigs[Math.min(level, 5)] || [];
  const soilY = potTop + 6;
  const dropY = waterAnim ? waterAnim.interpolate({ inputRange: [0,1], outputRange: [stemY0-40, stemY0+20] }) : null;
  const dropOpacity = waterAnim ? waterAnim.interpolate({ inputRange: [0,0.7,1], outputRange: [0,1,0] }) : null;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={potTop+potH-4} width={size} height={size*0.18} rx="4" fill="#8B6914" opacity="0.5" />
        <Path d={`M ${potX+10} ${potTop} L ${potX} ${potTop+potH*0.85} Q ${cx} ${potTop+potH+6} ${potX+potW} ${potTop+potH*0.85} L ${potX+potW-10} ${potTop} Z`} fill="#C16B3A" />
        <Path d={`M ${potX+10} ${potTop} L ${potX+16} ${potTop+potH*0.7}`} stroke="rgba(255,200,150,0.4)" strokeWidth="6" strokeLinecap="round" />
        <Ellipse cx={cx} cy={potTop} rx={potW/2} ry={size*0.04} fill="#D4845A" />
        <Ellipse cx={cx} cy={potTop} rx={potW/2-3} ry={size*0.03} fill="#B85C2A" />
        {level > 1 && <Path d={`M ${potX+6} ${potTop+potH*0.32} Q ${cx} ${potTop+potH*0.38} ${potX+potW-6} ${potTop+potH*0.32}`} stroke="#D4A574" strokeWidth="3" fill="none" strokeLinecap="round" />}
        <Ellipse cx={cx} cy={soilY} rx={potW/2-4} ry={size*0.025} fill="#3E1F05" />
        {[{x:cx-14,y:soilY-1,r:3},{x:cx+10,y:soilY,r:2.5},{x:cx-2,y:soilY+1,r:2}].map((p,i) => <Circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#5C3310" opacity="0.7" />)}
        {level > 1 && <Line x1={cx} y1={potTop} x2={cx} y2={stemY0} stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />}
        {level === 1 && <Ellipse cx={cx} cy={soilY-2} rx={8} ry={5} fill="#8B6914" />}
        {leaves.map((leaf, i) => (
          <G key={i} transform={`rotate(${leaf.angle}, ${leaf.x}, ${leaf.y})`}>
            <Ellipse cx={leaf.x} cy={leaf.y-leaf.r*0.3} rx={leaf.r*0.28} ry={leaf.r*0.72} fill={leaf.color} />
            <Line x1={leaf.x} y1={leaf.y} x2={leaf.x} y2={leaf.y-leaf.r*0.6} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round" />
          </G>
        ))}
        {level === 5 && [cx-12, cx, cx+12].map((gx,i) => (
          <G key={i}>
            <Ellipse cx={gx} cy={stemY0-8} rx={4} ry={8} fill="#FFD700" />
            <Ellipse cx={gx} cy={stemY0-14} rx={3} ry={5} fill="#FFC107" />
          </G>
        ))}
      </Svg>
      {waterAnim && dropY && (
        <Animated.View style={{ position:'absolute', left: cx-12, opacity: dropOpacity, transform:[{translateY: dropY}] }}>
          <MaterialCommunityIcons name="water" size={24} color="#4D96FF" />
        </Animated.View>
      )}
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────
const TreeGameModal = ({ visible, onClose }) => {
  const { isDarkMode, addNotification, addToCart, menuItems, cart } = useApp();
  const [xp, setXp]                   = useState(0);
  const [level, setLevel]             = useState(1);
  const [waterCount, setWaterCount]   = useState(0);
  const [fertCount, setFertCount]     = useState(0);
  const [missionStatus, setMissionStatus] = useState({});
  const [showMissions, setShowMissions]   = useState(false);
  const [showReward, setShowReward]       = useState(false);
  const [wonReward, setWonReward]         = useState(null);
  const treeScale = useRef(new Animated.Value(1)).current;
  const waterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (visible) loadProgress(); }, [visible]);

  useEffect(() => {
    let newLevel = 1;
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) { newLevel = i + 1; break; }
    }
    if (newLevel !== level) {
      setLevel(newLevel);
      if (newLevel > level) {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addNotification(`🎉 Pohonmu naik ke Level ${newLevel}!`, 'success');
      }
    }
  }, [xp]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem('@tree_progress');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        if (data.date !== today) {
          setWaterCount(0); setFertCount(0); setMissionStatus({});
          saveProgress(data.xp, 0, 0, {}, today);
        } else {
          setXp(data.xp || 0); setWaterCount(data.waterCount || 0);
          setFertCount(data.fertCount || 0); setMissionStatus(data.missionStatus || {});
        }
      } else {
        const ms = { 'DAILY_LOGIN': true };
        setMissionStatus(ms); addXpDirect(20);
        addNotification('Selamat! +20 XP untuk Login Harian.', 'info');
      }
    } catch (e) { console.log('loadProgress error', e); }
  };

  const saveProgress = async (newXp, newWater, newFert, newMs, dateStr = new Date().toISOString().split('T')[0]) => {
    try {
      await AsyncStorage.setItem('@tree_progress', JSON.stringify({ xp: newXp, waterCount: newWater, fertCount: newFert, missionStatus: newMs, date: dateStr }));
      setXp(newXp); setWaterCount(newWater); setFertCount(newFert); setMissionStatus(newMs);
    } catch (e) { console.log('saveProgress error', e); }
  };

  const addXpDirect = (amount) => {
    setXp(prev => prev + amount);
    Animated.sequence([
      Animated.timing(treeScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(treeScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleWater = () => {
    if (level === MAX_LEVEL) return addNotification('Pohon sudah maksimal! Silakan panen.', 'info');
    if (waterCount >= 5) return addNotification('Batas siram harian habis!', 'error');
    waterAnim.setValue(0);
    Animated.timing(waterAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const next = xp + 10;
    saveProgress(next, waterCount + 1, fertCount, missionStatus);
    addXpDirect(10);
  };

  const handleFertilize = () => {
    if (level === MAX_LEVEL) return addNotification('Pohon sudah maksimal! Silakan panen.', 'info');
    if (fertCount >= 2) return addNotification('Batas pupuk harian habis!', 'error');
    const next = xp + 30;
    saveProgress(next, waterCount, fertCount + 1, missionStatus);
    addXpDirect(30);
  };

  const handleClaimMission = (mission) => {
    if (missionStatus[mission.id]) return addNotification('Misi sudah diklaim!', 'error');
    if (mission.id === 'BUY_MIN_25K') {
      const total = cart?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
      if (total < 25000) return addNotification('Keranjang belum mencapai Rp 25.000!', 'error');
    }
    if (mission.link) Linking.openURL(mission.link);
    const newMs = { ...missionStatus, [mission.id]: true };
    const next = xp + mission.xp;
    saveProgress(next, waterCount, fertCount, newMs);
    addXpDirect(mission.xp);
    addNotification(`Misi selesai! +${mission.xp} XP`, 'success');
  };

  const handleHarvest = () => {
    if (level < MAX_LEVEL) return;
    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setWonReward(reward); setShowReward(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveProgress(0, 0, 0, missionStatus);
  };

  const handleClaimReward = () => {
    if (!wonReward) return;
    if (wonReward.type === 'food') {
      const item = menuItems.find(m => m.name.toLowerCase() === wonReward.dbName?.toLowerCase());
      if (item) { addToCart({ ...item, price: 0 }); addNotification(`🎁 ${wonReward.dbName} gratis ke keranjang!`, 'success'); }
      else addNotification('Menu tidak ditemukan.', 'error');
    } else if (wonReward.type === 'voucher') {
      Clipboard.setString(wonReward.code);
      addNotification(`🎫 Kode ${wonReward.code} disalin!`, 'success');
    }
    setShowReward(false);
  };

  const progressPercent = level === MAX_LEVEL ? 100
    : Math.min(100, Math.max(0, ((xp - XP_THRESHOLDS[level-1]) / (XP_THRESHOLDS[level] - XP_THRESHOLDS[level-1])) * 100));

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={s.bg}>
          <View style={[s.sheet, { backgroundColor: isDarkMode ? '#1a2f1a' : '#e6f2e6' }]}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.userRow}>
                <View style={s.avatar}><Text style={s.avatarTxt}>Me</Text></View>
                <View>
                  <Text style={[s.userName, { color: isDarkMode ? '#FFF' : '#333' }]}>Sobat Kuliner</Text>
                  <Text style={s.userLevel}>Lv {level} Pohon Berkah</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* Tree area */}
            <View style={s.treeArea}>
              <View style={s.progressWrap}>
                <Text style={s.progressTxt}>{xp} / {level === MAX_LEVEL ? 'MAX' : XP_THRESHOLDS[level]} XP</Text>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: treeScale }] }}>
                <PlantSVG level={level} size={180} waterAnim={waterAnim} />
              </Animated.View>
              {level === MAX_LEVEL && (
                <TouchableOpacity style={s.harvestBtn} onPress={handleHarvest}>
                  <Text style={s.harvestTxt}>🌾 PANEN SEKARANG 🌾</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={s.actionBtn} onPress={handleWater} disabled={level === MAX_LEVEL}>
                <MaterialCommunityIcons name="water" size={28} color="#4D96FF" />
                <Text style={s.actionTxt}>Siram</Text>
                <Text style={s.actionSub}>{5-waterCount}/5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FF9F29' }]} onPress={() => setShowMissions(true)}>
                <MaterialCommunityIcons name="format-list-checks" size={28} color="#FFF" />
                <Text style={s.actionTxt}>Misi</Text>
                <Text style={s.actionSub}>XP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#6BCB77' }]} onPress={handleFertilize} disabled={level === MAX_LEVEL}>
                <MaterialCommunityIcons name="leaf" size={28} color="#FFF" />
                <Text style={s.actionTxt}>Pupuk</Text>
                <Text style={s.actionSub}>{2-fertCount}/2</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Missions */}
      <Modal visible={showMissions} animationType="fade" transparent onRequestClose={() => setShowMissions(false)}>
        <View style={s.bg}>
          <View style={[s.missionSheet, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
            <View style={s.missionHeader}>
              <Text style={[s.missionTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>Misi Harian</Text>
              <TouchableOpacity onPress={() => setShowMissions(false)}>
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {MISSIONS.map(m => (
                <View key={m.id} style={[s.missionRow, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}>
                  <MaterialCommunityIcons name={m.icon} size={24} color="#FF8C00" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.missionName, { color: isDarkMode ? '#FFF' : '#333' }]}>{m.title}</Text>
                    <Text style={s.missionXp}>+{m.xp} XP</Text>
                  </View>
                  <TouchableOpacity style={[s.claimBtn, missionStatus[m.id] && { backgroundColor: '#AAA' }]} onPress={() => handleClaimMission(m)} disabled={!!missionStatus[m.id]}>
                    <Text style={s.claimTxt}>{missionStatus[m.id] ? 'Selesai' : 'Klaim'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reward */}
      <Modal visible={showReward} transparent animationType="fade">
        <View style={s.rewardBg}>
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i*80} color={REWARDS[i%REWARDS.length].color} x={Math.random()*(width-40)+20} />
          ))}
          <View style={[s.rewardCard, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
            <Text style={s.congratsTxt}>🎉 PANEN BERHASIL! 🎉</Text>
            <View style={[s.rewardIcon, { backgroundColor: wonReward?.color }]}>
              <Text style={{ fontSize: 44 }}>{wonReward?.emoji}</Text>
            </View>
            <Text style={[s.rewardName, { color: isDarkMode ? '#FFF' : '#333' }]}>{wonReward?.name}</Text>
            <Text style={[s.rewardDesc, { color: isDarkMode ? '#CCC' : '#555' }]}>{wonReward?.description}</Text>
            {wonReward?.type === 'voucher' && (
              <View style={s.voucherBox}><Text style={s.voucherCode}>{wonReward.code}</Text></View>
            )}
            <TouchableOpacity onPress={handleClaimReward} style={s.claimBtnLarge}>
              <Text style={s.claimTxtLarge}>KLAIM HADIAH 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  bg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:       { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: height * 0.8, alignItems: 'center' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  userRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF8C00', justifyContent: 'center', alignItems: 'center' },
  avatarTxt:   { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  userName:    { fontSize: 16, fontWeight: 'bold' },
  userLevel:   { fontSize: 12, color: '#FF8C00', fontWeight: 'bold' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  treeArea:    { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
  progressWrap:{ position: 'absolute', top: 15, width: '80%', alignItems: 'center' },
  progressTxt: { fontSize: 13, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  progressBg:  { width: '100%', height: 10, backgroundColor: '#DDD', borderRadius: 5, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: '#6BCB77' },
  harvestBtn:  { position: 'absolute', bottom: 20, backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 5 },
  harvestTxt:  { color: '#333', fontWeight: 'bold', fontSize: 14 },
  actions:     { flexDirection: 'row', width: '100%', gap: 10 },
  actionBtn:   { flex: 1, backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 18, alignItems: 'center', elevation: 3 },
  actionTxt:   { fontSize: 13, fontWeight: 'bold', marginTop: 4, color: '#333' },
  actionSub:   { fontSize: 10, color: '#666' },
  missionSheet:{ width: '90%', maxHeight: '80%', borderRadius: 20, padding: 20, alignSelf: 'center', marginBottom: '10%' },
  missionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  missionTitle: { fontSize: 18, fontWeight: 'bold' },
  missionRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  missionName:  { fontSize: 14, fontWeight: 'bold' },
  missionXp:    { fontSize: 12, color: '#6BCB77', fontWeight: 'bold' },
  claimBtn:     { backgroundColor: '#FF8C00', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14 },
  claimTxt:     { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  rewardBg:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  rewardCard:   { width: width * 0.85, borderRadius: 28, padding: 24, alignItems: 'center', elevation: 20 },
  congratsTxt:  { color: '#FFD700', fontSize: 20, fontWeight: '900', marginBottom: 18 },
  rewardIcon:   { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  rewardName:   { fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  rewardDesc:   { fontSize: 13, textAlign: 'center', marginBottom: 18 },
  voucherBox:   { padding: 10, backgroundColor: 'rgba(255,140,0,0.15)', borderRadius: 10, marginBottom: 18 },
  voucherCode:  { color: '#FF8C00', fontWeight: 'bold', fontSize: 16 },
  claimBtnLarge:{ backgroundColor: '#FF8C00', width: '100%', paddingVertical: 14, borderRadius: 18, alignItems: 'center' },
  claimTxtLarge:{ color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});

export default TreeGameModal;
