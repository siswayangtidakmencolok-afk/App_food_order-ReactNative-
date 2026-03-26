import React, { useRef, useState, useEffect } from 'react';
import {
  Alert, Animated, Dimensions, Linking, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ─── Stat Card Keren ────────────────────────────────────────────────
const StatCard = ({ icon, value, label, isDark }) => (
  <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>
    <MaterialCommunityIcons name={icon} size={28} color={isDark ? '#ddd' : '#EE4D2D'} style={{ marginBottom: 6 }} />
    <Text style={[styles.statValue, { color: isDark ? '#fff' : '#333' }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#888' }]} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
  </View>
);

const AnimatedSection = ({ children, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View style={{ 
      opacity: anim, 
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] 
    }}>
      {children}
    </Animated.View>
  );
};

const Section = ({ title, icon, children, cardCol, textCol }) => (
  <View style={[styles.section, { backgroundColor: cardCol }]}>
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={20} color="#EE4D2D" style={{ marginRight: 10 }} />
      <Text style={[styles.sectionTitle, { color: textCol }]}>{title}</Text>
    </View>
    {children}
  </View>
);

const ProfileScreen = () => {
  const {
    userProfile, updateProfile, isDarkMode,
    toggleDarkMode, orderHistory, favorites,
    clearCart, signOut
  } = useApp();

  const theme   = isDarkMode ? darkTheme : lightTheme;
  const bg      = isDarkMode ? '#121212' : '#f5f5f5';
  const card    = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const subText = isDarkMode ? '#888888' : '#888888';
  const border  = isDarkMode ? '#2a2a2a' : '#eeeeee';

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name:  userProfile?.name  || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
  });

  const editAnim = useRef(new Animated.Value(0)).current;

  const handleEditToggle = () => {
    if (!isEditing) {
      setTempProfile({
        name:  userProfile?.name  || '',
        email: userProfile?.email || '',
        phone: userProfile?.phone || '',
      });
      Animated.spring(editAnim, { toValue: 1, friction: 5, useNativeDriver: false }).start();
    } else {
      Animated.timing(editAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
    setIsEditing(prev => !prev);
  };

  const handleSave = async () => {
    if (!tempProfile.name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong!');
      return;
    }
    const { error } = await updateProfile({
      name:  tempProfile.name.trim(),
      phone: tempProfile.phone.trim(),
    });
    if (!error) {
      setIsEditing(false);
      Animated.timing(editAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const handleSignOut = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut }
    ]);
  };

  if (!userProfile) return <View style={[styles.loadingContainer, { backgroundColor: bg }]}><Text style={{ color: subText }}>Memuat profil...</Text></View>;

  const totalOrders = orderHistory.length;
  const totalSpent  = orderHistory.reduce((s, o) => s + (o.total || 0), 0);
  
  // Loyalty Tier System
  const getLoyaltyTier = () => {
    if (totalSpent > 1000000) return { title: 'Gold Member', color: '#FFD700', icon: 'crown' };
    if (totalSpent > 300000) return { title: 'Silver Member', color: '#C0C0C0', icon: 'medal' };
    return { title: 'Bronze Member', color: '#cd7f32', icon: 'star' };
  };
  const tier = getLoyaltyTier();

  const initials = (userProfile.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
      
      {/* ── HERO GRADIENT ── */}
      <LinearGradient 
        colors={isDarkMode ? ['#2D1A1A', '#121212'] : ['#FF6347', '#FF8C00']} 
        style={styles.hero}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.heroName}>{userProfile.name || 'Guest'}</Text>
        <Text style={styles.heroEmail}>{userProfile.email || '—'}</Text>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#fff" />
            <Text style={styles.badgeTxt}>Member Aktif</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: tier.color + '40', borderColor: tier.color, borderWidth: 1 }]}>
            <MaterialCommunityIcons name={tier.icon} size={12} color={tier.color} />
            <Text style={[styles.badgeTxt, { color: isDarkMode ? tier.color : '#fff', fontWeight: 'bold' }]}>{tier.title}</Text>
          </View>
        </View>

        {/* STATS FLOATING */}
        <View style={styles.statsRow}>
          <StatCard icon="shopping" value={totalOrders} label="Pesanan" isDark={isDarkMode} />
          <StatCard icon="wallet" value={`${(totalSpent / 1000).toFixed(0)}k`} label="Total Belanja" isDark={isDarkMode} />
          <StatCard icon="heart" value={favorites.length} label="Favorit" isDark={isDarkMode} />
        </View>
      </LinearGradient>

      {/* SPACE UNTUK STATS OVERLAP */}
      <View style={{ height: 50 }} />

      {/* ── INFORMASI PROFIL ── */}
      <AnimatedSection delay={150}>
        <Section icon="account" title="Informasi Profil" cardCol={card} textCol={textCol}>
        <View style={styles.sectionHeaderBtn}>
          <TouchableOpacity onPress={handleEditToggle} style={[styles.editBtn, { backgroundColor: isEditing ? border : theme.primary + '20' }]}>
            <Text style={[styles.editBtnTxt, { color: isEditing ? subText : theme.primary }]}>{isEditing ? 'Batal' : 'Edit Profil'}</Text>
          </TouchableOpacity>
        </View>

        {[
          { label: 'Nama Lengkap', key: 'name', icon: 'account-outline' },
          { label: 'Nomor Telepon', key: 'phone', icon: 'phone-outline' },
        ].map(field => (
          <View key={field.key} style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIconBox, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0' }]}>
                <MaterialCommunityIcons name={field.icon} size={18} color={subText} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: subText }]}>{field.label}</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.inputField, { color: textCol, borderColor: border }]}
                    value={tempProfile[field.key]}
                    onChangeText={v => setTempProfile(p => ({ ...p, [field.key]: v }))}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: textCol }]}>{userProfile[field.key] || '—'}</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={[styles.infoIconBox, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0' }]}>
              <MaterialCommunityIcons name="email-outline" size={18} color={subText} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: subText }]}>Email</Text>
              <Text style={[styles.infoValue, { color: subText, fontStyle: 'italic' }]}>{userProfile.email || '—'}</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
            <Text style={styles.saveBtnTxt}>Simpan Perubahan</Text>
          </TouchableOpacity>
        )}
        </Section>
      </AnimatedSection>

      {/* ── PENGATURAN ── */}
      <AnimatedSection delay={300}>
        <Section icon="cog" title="Pengaturan Aplikasi" cardCol={card} textCol={textCol}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: isDarkMode ? '#3a3a3a' : '#ffe4e1' }]}>
              <MaterialCommunityIcons name={isDarkMode ? "weather-night" : "weather-sunny"} size={20} color={isDarkMode ? "#fff" : "#EE4D2D"} />
            </View>
            <View>
              <Text style={[styles.settingName, { color: textCol }]}>Mode Gelap (Dark Mode)</Text>
              <Text style={[styles.settingDesc, { color: subText }]}>Beralih ke tampilan gelap yang elegan</Text>
            </View>
          </View>
          <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#ddd', true: '#EE4D2D' }} thumbColor={'#fff'} />
        </View>
        
        <View style={[styles.divider, { backgroundColor: border }]} />

        <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Info', 'Notifikasi akan segera hadir!')}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: isDarkMode ? '#3a3a3a' : '#e0f7fa' }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={isDarkMode ? "#fff" : "#00acc1"} />
            </View>
            <View>
              <Text style={[styles.settingName, { color: textCol }]}>Pemberitahuan</Text>
              <Text style={[styles.settingDesc, { color: subText }]}>Kelola notifikasi pesanan dan promosi</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={subText} />
        </TouchableOpacity>
        </Section>
      </AnimatedSection>

      {/* ── ZONA BAHAYA ── */}
      <AnimatedSection delay={450}>
        <View style={[styles.section, { backgroundColor: card }]}>
        <TouchableOpacity style={styles.dangerRow} onPress={() => {
          Alert.alert('Kosongkan Keranjang', 'Hapus semua item?', [
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: () => { clearCart(); Alert.alert('Berhasil', 'Keranjang dikosongkan'); } }
          ])
        }}>
          <MaterialCommunityIcons name="cart-remove" size={20} color="#ff4444" style={{ marginRight: 12 }} />
          <Text style={styles.dangerTxt}>Kosongkan Keranjang Belanja</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerRow} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={20} color="#ff4444" style={{ marginRight: 12 }} />
          <Text style={styles.dangerTxt}>Keluar dari Akun</Text>
        </TouchableOpacity>
        </View>
      </AnimatedSection>

      <Text style={[styles.appVer, { color: subText }]}>FoodApp v1.0.0 (Premium OS)</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { paddingTop: 40, paddingBottom: 80, alignItems: 'center', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#EE4D2D' },
  heroName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroEmail: { fontSize: 13, color: '#f0f0f0', marginBottom: 16 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  badgeTxt: { fontSize: 11, color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 12, position: 'absolute', bottom: -50, width: '100%', paddingHorizontal: 20 },
  statCard: { flex: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  sectionHeaderBtn: { position: 'absolute', top: -5, right: 0, zIndex: 10 },
  editBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  editBtnTxt: { fontSize: 12, fontWeight: 'bold' },
  infoRow: { marginBottom: 16 },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLabel: { fontSize: 12, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  inputField: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, fontSize: 14, width: width - 120 },
  saveBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  settingDesc: { fontSize: 11 },
  divider: { height: 1, marginVertical: 4 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dangerTxt: { fontSize: 14, fontWeight: 'bold', color: '#ff4444' },
  appVer: { textAlign: 'center', marginTop: 20, fontSize: 12 }
});

export default ProfileScreen;