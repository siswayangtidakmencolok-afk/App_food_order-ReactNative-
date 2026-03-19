// src/screens/ProfileScreen.js
// Design direction: Dark luxury — refined, editorial, high-contrast
// Stats card: glassmorphism overlay di atas hero gradient
// Sections: card dengan subtle border, bukan shadow tebal

import { useRef, useState } from 'react';
import {
  Alert,
  Animated, Dimensions,
  Linking, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ─── Stat Card ────────────────────────────────────────────────
// Card kaca transparan untuk statistik utama di hero area
const StatCard = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderColor: color + '33' }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Section Row ──────────────────────────────────────────────
// Baris info dengan label kiri, value kanan
const InfoRow = ({ label, value, valueColor, textCol, subText }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: subText }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: valueColor || textCol }]}>{value}</Text>
  </View>
);

// ─── Section Wrapper ──────────────────────────────────────────
const Section = ({ title, icon, children, card, textCol }) => (
  <View style={[styles.section, { backgroundColor: card }]}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color: textCol }]}>{title}</Text>
    </View>
    {children}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
const ProfileScreen = () => {
  const {
    userProfile, updateProfile, isDarkMode,
    toggleDarkMode, orderHistory, favorites,
    clearCart, signOut
  } = useApp();

  const theme   = isDarkMode ? darkTheme : lightTheme;
  const bg      = isDarkMode ? '#0f0f0f' : '#f0f2f5';
  const card    = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const subText = isDarkMode ? '#888888' : '#888888';
  const border  = isDarkMode ? '#2a2a2a' : '#eeeeee';

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name:  userProfile?.name  || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
  });

  // Animasi edit mode masuk
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

  // ── Kalau profile belum loaded ─────────────────────────
  if (!userProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={{ color: subText, marginTop: 12 }}>Memuat profil...</Text>
      </View>
    );
  }

  // ── Computed stats ─────────────────────────────────────
  const totalOrders    = orderHistory.length;
  const totalSpent     = orderHistory.reduce((s, o) => s + (o.total || 0), 0);
  const completedOrders = orderHistory.filter(o => o.status === 'Delivered').length;
  const pendingOrders  = orderHistory.filter(o => o.status !== 'Delivered').length;
  const avgSpend       = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  // ── Durasi member ──────────────────────────────────────
  const getMemberDuration = () => {
    if (!userProfile.memberSince) return '—';
    const diff = Math.ceil(
      Math.abs(new Date() - new Date(userProfile.memberSince)) / (1000 * 60 * 60 * 24)
    );
    if (diff < 30)  return `${diff} hari`;
    if (diff < 365) return `${Math.floor(diff / 30)} bulan`;
    return `${Math.floor(diff / 365)} tahun`;
  };

  // ── Initials avatar ────────────────────────────────────
  const initials = (userProfile.name || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════════════════════════
          HERO SECTION — gradient + avatar + name
          ════════════════════════════════════════ */}
      <View style={styles.hero}>
        {/* Background gradient diagonal */}
        <View style={styles.heroBg} />
        <View style={styles.heroAccent} />

        {/* Avatar lingkaran besar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Nama & info */}
        <Text style={styles.heroName}>{userProfile.name || 'Guest'}</Text>
        <Text style={styles.heroEmail}>{userProfile.email || '—'}</Text>
        <View style={styles.memberBadge}>
          <Text style={styles.memberBadgeTxt}>
            🏅 Member {getMemberDuration()}
          </Text>
        </View>

        {/* ── 3 Stat Card utama ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="📦"
            value={totalOrders}
            label="Pesanan"
            color="#FF6347"
          />
          <StatCard
            icon="💰"
            value={`${(totalSpent / 1000).toFixed(0)}k`}
            label="Total Belanja"
            color="#4CAF50"
          />
          <StatCard
            icon="❤️"
            value={favorites.length}
            label="Favorit"
            color="#E91E63"
          />
        </View>
      </View>

      {/* ════════════════════════════════════════
          STATISTIK DETAIL
          ════════════════════════════════════════ */}
      <Section icon="📊" title="Statistik Pesanan" card={card} textCol={textCol}>
        <InfoRow label="Pesanan Selesai"       value={completedOrders} valueColor="#4CAF50" textCol={textCol} subText={subText} />
        <View style={[styles.divider, { backgroundColor: border }]} />
        <InfoRow label="Sedang Diproses"       value={pendingOrders}   valueColor="#FF9800" textCol={textCol} subText={subText} />
        <View style={[styles.divider, { backgroundColor: border }]} />
        <InfoRow label="Rata-rata Nilai Order" value={`Rp ${avgSpend.toLocaleString('id-ID')}`} valueColor={theme.primary} textCol={textCol} subText={subText} />
        <View style={[styles.divider, { backgroundColor: border }]} />
        <InfoRow label="Total Belanja"         value={`Rp ${totalSpent.toLocaleString('id-ID')}`} valueColor="#4CAF50" textCol={textCol} subText={subText} />
      </Section>

      {/* ════════════════════════════════════════
          INFORMASI PROFIL
          ════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: card }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>👤</Text>
          <Text style={[styles.sectionTitle, { color: textCol }]}>Informasi Profil</Text>
          {/* Tombol edit di pojok kanan */}
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: isEditing ? '#eee' : theme.primary + '18', borderColor: isEditing ? '#ddd' : theme.primary + '44' }]}
            onPress={isEditing ? handleEditToggle : handleEditToggle}
          >
            <Text style={[styles.editBtnTxt, { color: isEditing ? '#999' : theme.primary }]}>
              {isEditing ? 'Batal' : '✏️ Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        {[
          { label: 'Nama Lengkap', key: 'name',  keyboard: 'default',       placeholder: 'Masukkan nama' },
          { label: 'Nomor Telepon', key: 'phone', keyboard: 'phone-pad',     placeholder: '08xxxxxxxxxx' },
        ].map(field => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: subText }]}>{field.label}</Text>
            {isEditing ? (
              <Animated.View style={{
                opacity: editAnim,
                transform: [{ translateX: editAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
              }}>
                <TextInput
                  style={[styles.fieldInput, { color: textCol, borderColor: theme.primary + '66', backgroundColor: bg }]}
                  value={tempProfile[field.key]}
                  onChangeText={val => setTempProfile(prev => ({ ...prev, [field.key]: val }))}
                  keyboardType={field.keyboard}
                  placeholder={field.placeholder}
                  placeholderTextColor={subText}
                />
              </Animated.View>
            ) : (
              <Text style={[styles.fieldValue, { color: textCol }]}>
                {userProfile[field.key] || '—'}
              </Text>
            )}
          </View>
        ))}

        {/* Email — tidak bisa diedit */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: subText }]}>Email</Text>
          <Text style={[styles.fieldValue, { color: subText, fontStyle: 'italic' }]}>
            {userProfile.email || '—'}
          </Text>
        </View>

        {/* Tombol simpan */}
        {isEditing && (
          <Animated.View style={{ opacity: editAnim }}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnTxt}>💾 Simpan Perubahan</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* ════════════════════════════════════════
          PENGATURAN
          ════════════════════════════════════════ */}
      <Section icon="⚙️" title="Pengaturan" card={card} textCol={textCol}>
        {/* Dark mode toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: '#1a1a2e' }]}>
              <Text style={{ fontSize: 16 }}>🌙</Text>
            </View>
            <View>
              <Text style={[styles.settingName, { color: textCol }]}>Mode Gelap</Text>
              <Text style={[styles.settingDesc, { color: subText }]}>Nyaman di mata saat malam</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#ddd', true: theme.primary + '88' }}
            thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        {/* Notifikasi */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert('Info', 'Notifikasi push akan segera hadir!')}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: '#1a2a1a' }]}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <View>
              <Text style={[styles.settingName, { color: textCol }]}>Notifikasi</Text>
              <Text style={[styles.settingDesc, { color: subText }]}>Update status pesanan</Text>
            </View>
          </View>
          <Text style={{ color: subText, fontSize: 20 }}>›</Text>
        </TouchableOpacity>
      </Section>

      {/* ════════════════════════════════════════
          ZONA BAHAYA
          ════════════════════════════════════════ */}
      <Section icon="⚠️" title="Zona Bahaya" card={card} textCol={textCol}>
        <TouchableOpacity
          style={[styles.dangerRow, { borderColor: '#ff444422', backgroundColor: '#ff444408' }]}
          onPress={() => {
            Alert.alert('Kosongkan Keranjang', 'Hapus semua item di keranjang?', [
              { text: 'Batal', style: 'cancel' },
              { text: 'Hapus', style: 'destructive', onPress: () => { clearCart(); Alert.alert('Berhasil', 'Keranjang dikosongkan'); } }
            ]);
          }}
        >
          <Text style={{ fontSize: 18 }}>🗑️</Text>
          <Text style={styles.dangerTxt}>Kosongkan Keranjang</Text>
        </TouchableOpacity>
      </Section>

      {/* ════════════════════════════════════════
          SOCIAL LINKS
          ════════════════════════════════════════ */}
      <View style={[styles.section, { backgroundColor: card }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🌐</Text>
          <Text style={[styles.sectionTitle, { color: textCol }]}>Supported by Me</Text>
        </View>

        <View style={styles.socialGrid}>
          {[
            { icon: '📸', label: 'Instagram', url: 'https://www.instagram.com/f.zvvn_/', color: '#E1306C' },
            { icon: '🎵', label: 'TikTok',    url: 'https://tiktok.com/@eksrovertselalu',        color: '#000000' },
            { icon: '▶️', label: 'YouTube',   url: 'https://www.youtube.com/@zxyninety293',      color: '#FF0000' },
            { icon: '💬', label: 'Discord',   url: 'https://discord.com/channels/@zxyninety',    color: '#5865F2' },
            { icon: '✈️', label: 'Telegram',  url: 'https://t.me/Art_zwn',                       color: '#2CA5E0' },
          ].map(s => (
            <TouchableOpacity
              key={s.label}
              style={[styles.socialBtn, { borderColor: s.color + '33', backgroundColor: s.color + '0d' }]}
              onPress={() => Linking.openURL(s.url)}
            >
              <Text style={{ fontSize: 20 }}>{s.icon}</Text>
              <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Project links */}
        <Text style={[styles.projectTitle, { color: subText }]}>🚀 Project Lain</Text>
        {[
          { label: '🌍 Globe 3D',            url: 'https://globe3d-byfhaz.netlify.app/' },
          { label: '🧝‍♀️ Website Frieren',     url: 'https://siswayangtidakmencolok-afk.github.io/website-frieren/' },
          { label: '⏱️ World Clock & Timer',  url: 'https://worldclockandtimer.netlify.app/' },
          { label: '📝 Register Siswa',       url: 'https://student-registration-sage-delta.vercel.app/' },
        ].map(p => (
          <TouchableOpacity
            key={p.label}
            style={[styles.projectRow, { borderBottomColor: border }]}
            onPress={() => Linking.openURL(p.url)}
          >
            <Text style={[styles.projectLabel, { color: textCol }]}>{p.label}</Text>
            <Text style={{ color: subText }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════════════════════════════
          LOGOUT BUTTON
          ════════════════════════════════════════ */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutTxt}>🚪 Keluar dari Akun</Text>
      </TouchableOpacity>

      {/* App version */}
      <View style={styles.appInfo}>
        <Text style={[styles.appVer, { color: subText }]}>FoodApp v1.0.0</Text>
        <Text style={[styles.appVer, { color: subText }]}>Made with ❤️ for learning</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1 },
  loadingContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Hero ──
  hero:            { paddingTop: 40, paddingBottom: 24, alignItems: 'center', position: 'relative', overflow: 'hidden', minHeight: 340 },
  heroBg:          { ...StyleSheet.absoluteFillObject, backgroundColor: '#FF6347' },
  heroAccent:      { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' },
  avatarRing:      { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar:          { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  avatarText:      { fontSize: 28, fontWeight: '900', color: '#fff' },
  heroName:        { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroEmail:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  memberBadge:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  memberBadgeTxt:  { color: '#fff', fontSize: 12, fontWeight: '600' },

  // ── Stats row di hero ──
  statsRow:        { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  statCard:        { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
  statIcon:        { fontSize: 22, marginBottom: 4 },
  statValue:       { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel:       { fontSize: 10, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  // ── Section ──
  section:         { marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon:     { fontSize: 20, marginRight: 10 },
  sectionTitle:    { fontSize: 16, fontWeight: '800', flex: 1 },

  // ── Info rows ──
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel:       { fontSize: 14 },
  infoValue:       { fontSize: 14, fontWeight: '700' },
  divider:         { height: 1, marginVertical: 2 },

  // ── Profile fields ──
  fieldGroup:      { marginBottom: 14 },
  fieldLabel:      { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue:      { fontSize: 15, fontWeight: '500', paddingVertical: 4 },
  fieldInput:      { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 15 },
  editBtn:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  editBtnTxt:      { fontSize: 13, fontWeight: '700' },
  saveBtn:         { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnTxt:      { color: '#fff', fontSize: 15, fontWeight: '800' },

  // ── Settings ──
  settingRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  settingLeft:     { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIconBox:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingName:     { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  settingDesc:     { fontSize: 12 },

  // ── Danger ──
  dangerRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  dangerTxt:       { fontSize: 15, fontWeight: '700', color: '#ff4444' },

  // ── Social ──
  socialGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  socialBtn:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
  socialLabel:     { fontSize: 13, fontWeight: '700' },
  projectTitle:    { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  projectRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  projectLabel:    { fontSize: 14, fontWeight: '500' },

  // ── Logout ──
  logoutBtn:       { marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#ff444415', borderWidth: 1.5, borderColor: '#ff444433' },
  logoutTxt:       { color: '#ff4444', fontSize: 16, fontWeight: '800' },

  // ── App info ──
  appInfo:         { alignItems: 'center', paddingVertical: 20 },
  appVer:          { fontSize: 12, marginBottom: 4 },
});

export default ProfileScreen;