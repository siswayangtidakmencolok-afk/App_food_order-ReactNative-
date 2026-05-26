import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Animated, Easing, Dimensions, Platform, ScrollView, Clipboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useApp } from '../../context/AppContext';
import ConfettiParticle from './ConfettiParticle';

const { width, height } = Dimensions.get('window');

const MAX_LEVEL = 5;
const XP_THRESHOLDS = [0, 50, 150, 300, 500]; // XP req for Lv 1, 2, 3, 4, 5

const MISSIONS = [
  { id: 'DAILY_LOGIN', title: 'Login Harian', xp: 20, icon: 'calendar-check', link: null },
  { id: 'BUY_MIN_25K', title: 'Belanja Min. Rp 25.000', xp: 40, icon: 'cart-check', link: null },
  { id: 'FOLLOW_IG', title: 'Follow Instagram', xp: 25, icon: 'instagram', link: 'https://www.instagram.com/f.zvvn_/' },
  { id: 'FOLLOW_TIKTOK', title: 'Follow TikTok', xp: 25, icon: 'music-note', link: 'https://www.tiktok.com/@eksrovertselalu' },
  { id: 'JOIN_DISCORD', title: 'Join Discord', xp: 25, icon: 'chat', link: 'https://discord.com/channels/@zxyninety' },
  { id: 'VISIT_FRIEREN', title: 'Kunjungi Web Frieren', xp: 30, icon: 'web', link: 'https://siswayangtidakmencolok-afk.github.io/website-frieren/' },
  { id: 'VISIT_3D', title: 'Lihat 3D Global', xp: 30, icon: 'earth', link: 'https://globe3d-byfhaz.netlify.app/' },
];

const REWARDS = [
  { type: 'voucher', name: 'Diskon 30%', code: 'FS30TREE', color: '#4D96FF', emoji: '🎫', description: 'Diskon 30% berkat panen pohon!' },
  { type: 'voucher', name: 'Gratis Ongkir', code: 'FSTREEONGKIR', color: '#FF9F29', emoji: '🛵', description: 'Gratis ongkir untuk pesanan Anda!' },
  { type: 'voucher', name: 'Potongan Rp 15.000', code: 'FSTREE15K', color: '#FFD93D', emoji: '💵', description: 'Potongan langsung Rp 15.000.' },
  { type: 'food', name: 'Ayam Goreng Kriuk', dbName: 'Ayam Goreng', color: '#FF6B6B', emoji: '🍗', description: 'Ayam Goreng gratis ditambahkan ke keranjang!' }
];

const TreeGameModal = ({ visible, onClose }) => {
  const { isDarkMode, addNotification, addToCart, menuItems, cart } = useApp();
  
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [waterCount, setWaterCount] = useState(0);
  const [fertCount, setFertCount] = useState(0);
  const [missionStatus, setMissionStatus] = useState({});
  const [showMissions, setShowMissions] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [wonReward, setWonReward] = useState(null);

  const treeScale = useRef(new Animated.Value(1)).current;
  const waterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) loadProgress();
  }, [visible]);

  useEffect(() => {
    // Determine level based on XP
    let newLevel = 1;
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
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
          // Reset daily stats
          setWaterCount(0);
          setFertCount(0);
          setMissionStatus({});
          saveProgress(data.xp, 0, 0, {}, today);
        } else {
          setXp(data.xp || 0);
          setWaterCount(data.waterCount || 0);
          setFertCount(data.fertCount || 0);
          setMissionStatus(data.missionStatus || {});
        }
      } else {
        // Init daily login
        const ms = { 'DAILY_LOGIN': true };
        setMissionStatus(ms);
        addXp(20);
        addNotification('Selamat! +20 XP untuk Login Harian.', 'info');
      }
    } catch (e) {
      console.log('Error loading progress:', e);
    }
  };

  const saveProgress = async (newXp, newWater, newFert, newMissionStatus, dateStr = new Date().toISOString().split('T')[0]) => {
    try {
      const data = {
        xp: newXp,
        waterCount: newWater,
        fertCount: newFert,
        missionStatus: newMissionStatus,
        date: dateStr
      };
      await AsyncStorage.setItem('@tree_progress', JSON.stringify(data));
      setXp(newXp);
      setWaterCount(newWater);
      setFertCount(newFert);
      setMissionStatus(newMissionStatus);
    } catch (e) {
      console.log('Error saving progress:', e);
    }
  };

  const animateTree = () => {
    Animated.sequence([
      Animated.timing(treeScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(treeScale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const animateWater = () => {
    waterAnim.setValue(0);
    Animated.timing(waterAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  };

  const addXp = (amount) => {
    setXp(prev => prev + amount);
    saveProgress(xp + amount, waterCount, fertCount, missionStatus);
    animateTree();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleWater = () => {
    if (level === MAX_LEVEL) return addNotification('Pohon sudah maksimal! Silakan panen.', 'info');
    if (waterCount >= 5) return addNotification('Batas siram air harian habis!', 'error');
    animateWater();
    addXp(10);
    saveProgress(xp + 10, waterCount + 1, fertCount, missionStatus);
  };

  const handleFertilize = () => {
    if (level === MAX_LEVEL) return addNotification('Pohon sudah maksimal! Silakan panen.', 'info');
    if (fertCount >= 2) return addNotification('Batas pupuk harian habis!', 'error');
    addXp(30);
    saveProgress(xp + 30, waterCount, fertCount + 1, missionStatus);
  };

  const handleClaimMission = (mission) => {
    if (missionStatus[mission.id]) return addNotification('Misi sudah diklaim hari ini!', 'error');
    
    // Simulate check for shopping mission
    if (mission.id === 'BUY_MIN_25K') {
      const cartTotal = cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      if (cartTotal < 25000) {
        return addNotification('Keranjang Anda belum mencapai Rp 25.000!', 'error');
      }
    }

    if (mission.link) {
      Linking.openURL(mission.link);
    }

    const newMs = { ...missionStatus, [mission.id]: true };
    addXp(mission.xp);
    saveProgress(xp + mission.xp, waterCount, fertCount, newMs);
    addNotification(`Misi selesai! +${mission.xp} XP`, 'success');
  };

  const handleHarvest = () => {
    if (level < MAX_LEVEL) return;
    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setWonReward(reward);
    setShowReward(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Reset tree
    saveProgress(0, 0, 0, missionStatus);
  };

  const handleClaimReward = () => {
    if (!wonReward) return;

    if (wonReward.type === 'food') {
      let targetItem = menuItems.find(item => item.name.toLowerCase() === wonReward.dbName.toLowerCase());
      if (targetItem) {
        addToCart({ ...targetItem, price: 0 });
        addNotification(`🎁 ${wonReward.dbName} gratis telah ditambahkan ke keranjang!`, 'success');
      } else {
        addNotification(`🎁 Gagal menambahkan ke keranjang, menu tidak ditemukan.`, 'error');
      }
    } else if (wonReward.type === 'voucher') {
      Clipboard.setString(wonReward.code);
      addNotification(`🎫 Kode Voucher ${wonReward.code} disalin!`, 'success');
    }
    setShowReward(false);
  };

  const getTreeEmoji = () => {
    if (level === 1) return '🌱';
    if (level === 2) return '🌿';
    if (level === 3) return '🌲';
    if (level === 4) return '🌳';
    return '🌾';
  };

  const progressPercent = level === MAX_LEVEL ? 100 : Math.min(100, Math.max(0, ((xp - XP_THRESHOLDS[level-1]) / (XP_THRESHOLDS[level] - XP_THRESHOLDS[level-1])) * 100));

  const dropY = waterAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 150] });
  const dropOpacity = waterAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 1, 0] });

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a2f1a' : '#e6f2e6' }]}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}><Text style={styles.avatarText}>Me</Text></View>
                <View>
                  <Text style={[styles.userName, { color: isDarkMode ? '#FFF' : '#333' }]}>Sobat Kuliner</Text>
                  <Text style={styles.userLevel}>Lv {level} Pohon Berkah</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>

            {/* Tree Area */}
            <View style={styles.treeArea}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{xp} / {level === MAX_LEVEL ? 'MAX' : XP_THRESHOLDS[level]} XP</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>

              <Animated.Text style={[styles.treeEmoji, { transform: [{ scale: treeScale }] }]}>
                {getTreeEmoji()}
              </Animated.Text>

              {/* Water Drop Animation */}
              <Animated.View style={[styles.waterDrop, { opacity: dropOpacity, transform: [{ translateY: dropY }] }]}>
                <MaterialCommunityIcons name="water" size={40} color="#4D96FF" />
              </Animated.View>

              {/* Harvest Button */}
              {level === MAX_LEVEL && (
                <TouchableOpacity style={styles.harvestBtn} onPress={handleHarvest}>
                  <Text style={styles.harvestBtnText}>🌾 PANEN SEKARANG 🌾</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleWater} disabled={level === MAX_LEVEL}>
                <MaterialCommunityIcons name="water" size={32} color="#4D96FF" />
                <Text style={styles.actionText}>Siram</Text>
                <Text style={styles.actionSubtext}>{5 - waterCount}/5</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9F29' }]} onPress={() => setShowMissions(true)}>
                <MaterialCommunityIcons name="format-list-checks" size={32} color="#FFF" />
                <Text style={styles.actionText}>Misi</Text>
                <Text style={styles.actionSubtext}>Dapat XP</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6BCB77' }]} onPress={handleFertilize} disabled={level === MAX_LEVEL}>
                <MaterialCommunityIcons name="leaf" size={32} color="#FFF" />
                <Text style={styles.actionText}>Pupuk</Text>
                <Text style={styles.actionSubtext}>{2 - fertCount}/2</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Missions Modal */}
      <Modal visible={showMissions} animationType="fade" transparent={true} onRequestClose={() => setShowMissions(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.missionContent, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
            <View style={styles.missionHeader}>
              <Text style={[styles.missionTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>Misi Harian</Text>
              <TouchableOpacity onPress={() => setShowMissions(false)}>
                <MaterialCommunityIcons name="close" size={24} color={isDarkMode ? '#FFF' : '#333'} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ width: '100%' }}>
              {MISSIONS.map(m => (
                <View key={m.id} style={[styles.missionItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}>
                  <MaterialCommunityIcons name={m.icon} size={28} color="#FF8C00" style={{ marginRight: 15 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.missionItemTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>{m.title}</Text>
                    <Text style={styles.missionItemXp}>+{m.xp} XP</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.claimMissionBtn, missionStatus[m.id] && { backgroundColor: '#AAA' }]}
                    onPress={() => handleClaimMission(m)}
                    disabled={missionStatus[m.id]}
                  >
                    <Text style={styles.claimMissionText}>{missionStatus[m.id] ? 'Selesai' : 'Klaim'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reward Modal */}
      <Modal visible={showReward} transparent={true} animationType="fade">
        <View style={styles.rewardModalBg}>
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle key={`confetti-${i}`} delay={i * 80} color={REWARDS[i % REWARDS.length].color} x={Math.random() * (width - 40) + 20} />
          ))}
          <View style={[styles.rewardCard, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
            <Text style={styles.congratulationsText}>🎉 PANEN BERHASIL! 🎉</Text>
            <View style={[styles.rewardIconCircle, { backgroundColor: wonReward?.color || '#FF8C00' }]}>
              <Text style={styles.rewardIconText}>{wonReward?.emoji}</Text>
            </View>
            <Text style={[styles.rewardTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>{wonReward?.name}</Text>
            <Text style={[styles.rewardDescription, { color: isDarkMode ? '#CCC' : '#555' }]}>{wonReward?.description}</Text>
            {wonReward?.type === 'voucher' && (
              <View style={styles.voucherBox}>
                <Text style={styles.voucherCodeText}>{wonReward.code}</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleClaimReward} style={styles.claimButton}>
              <Text style={styles.claimButtonText}>KLAIM HADIAH 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: height * 0.8, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF8C00', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userLevel: { fontSize: 12, color: '#FF8C00', fontWeight: 'bold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  treeArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
  treeEmoji: { fontSize: 120 },
  waterDrop: { position: 'absolute', top: 50 },
  progressContainer: { position: 'absolute', top: 15, width: '80%', alignItems: 'center' },
  progressText: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: '#DDD', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6BCB77' },
  harvestBtn: { position: 'absolute', bottom: 30, backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, elevation: 5 },
  harvestBtnText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: '#FFF', paddingVertical: 15, borderRadius: 20, alignItems: 'center', elevation: 3 },
  actionText: { fontSize: 14, fontWeight: 'bold', marginTop: 5, color: '#333' },
  actionSubtext: { fontSize: 11, color: '#666' },
  missionContent: { width: '90%', maxHeight: '80%', borderRadius: 20, padding: 20, alignSelf: 'center', marginBottom: '10%' },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  missionTitle: { fontSize: 20, fontWeight: 'bold' },
  missionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  missionItemTitle: { fontSize: 15, fontWeight: 'bold' },
  missionItemXp: { fontSize: 13, color: '#6BCB77', fontWeight: 'bold' },
  claimMissionBtn: { backgroundColor: '#FF8C00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  claimMissionText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  rewardModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 99999 },
  rewardCard: { width: width * 0.85, borderRadius: 30, padding: 24, alignItems: 'center', elevation: 20 },
  congratulationsText: { color: '#FFD700', fontSize: 22, fontWeight: '900', marginBottom: 20 },
  rewardIconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  rewardIconText: { fontSize: 48 },
  rewardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  rewardDescription: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
  voucherBox: { padding: 10, backgroundColor: 'rgba(255, 140, 0, 0.15)', borderRadius: 10, marginBottom: 20 },
  voucherCodeText: { color: '#FF8C00', fontWeight: 'bold', fontSize: 18 },
  claimButton: { backgroundColor: '#FF8C00', width: '100%', paddingVertical: 14, borderRadius: 20, alignItems: 'center' },
  claimButtonText: { color: '#FFF', fontWeight: 'bold' }
});

export default TreeGameModal;
