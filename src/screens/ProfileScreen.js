// src/screens/ProfileScreen.js - ADVANCED VERSION
import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const ProfileScreen = () => {
  const { 
    userProfile, 
    setUserProfile, 
    isDarkMode, 
    toggleDarkMode,
    orderHistory,
    favorites,
    clearCart
  } = useApp();
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSave = () => {
    if (!tempProfile.name.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong!');
      return;
    }
    setUserProfile(tempProfile);
    setIsEditing(false);
    Alert.alert('Berhasil!', 'Profile berhasil diperbarui');
  };

  const handleCancel = () => {
    setTempProfile(userProfile);
    setIsEditing(false);
  };

  const getMemberDuration = () => {
    const joinDate = new Date(userProfile.memberSince);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} hari`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan`;
    return `${Math.floor(diffDays / 365)} tahun`;
  };

  // Calculate order stats
  const completedOrders = orderHistory.filter(o => o.status === 'Delivered').length;
  const pendingOrders = orderHistory.filter(o => o.status !== 'Delivered').length;
  const avgOrderValue = orderHistory.length > 0 
    ? Math.round(userProfile.totalSpent / orderHistory.length) 
    : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Profile */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>
        <Text style={styles.headerName}>{userProfile.name || 'Guest User'}</Text>
        <Text style={styles.headerSubtitle}>
          Member sejak {getMemberDuration()} yang lalu
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {orderHistory.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Pesanan
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            Rp {(userProfile.totalSpent / 1000).toFixed(0)}k
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Belanja
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {favorites.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Favorit
          </Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          📊 Statistik Pesanan
        </Text>
        <View style={styles.statRow}>
          <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>
            Pesanan Selesai
          </Text>
          <Text style={[styles.statRowValue, { color: theme.success }]}>
            {completedOrders}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>
            Pesanan Dalam Proses
          </Text>
          <Text style={[styles.statRowValue, { color: theme.warning }]}>
            {pendingOrders}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>
            Rata-rata Nilai Pesanan
          </Text>
          <Text style={[styles.statRowValue, { color: theme.primary }]}>
            Rp {avgOrderValue.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {/* Profile Information */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            👤 Informasi Profile
          </Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nama Lengkap</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.border 
              },
              !isEditing && styles.inputDisabled
            ]}
            value={isEditing ? tempProfile.name : userProfile.name}
            onChangeText={(text) => setTempProfile({...tempProfile, name: text})}
            editable={isEditing}
            placeholder="Masukkan nama"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.border 
              },
              !isEditing && styles.inputDisabled
            ]}
            value={isEditing ? tempProfile.email : userProfile.email}
            onChangeText={(text) => setTempProfile({...tempProfile, email: text})}
            editable={isEditing}
            placeholder="email@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nomor Telepon</Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.border 
              },
              !isEditing && styles.inputDisabled
            ]}
            value={isEditing ? tempProfile.phone : userProfile.phone}
            onChangeText={(text) => setTempProfile({...tempProfile, phone: text})}
            editable={isEditing}
            placeholder="08xxxxxxxxxx"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#999' }]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.success }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          ⚙️ Pengaturan
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Mode Gelap
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Nyaman di mata saat malam
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#ccc', true: theme.success }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => Alert.alert('Info', 'Notifikasi akan segera hadir!')}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                Notifikasi Push
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Update status pesanan
              </Text>
            </View>
          </View>
          <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.error }]}>
          ⚠️ Zona Bahaya
        </Text>
        
        <TouchableOpacity 
          style={[styles.dangerButton, { borderColor: theme.error }]}
          onPress={() => {
            Alert.alert(
              'Hapus Keranjang',
              'Yakin ingin menghapus semua item di keranjang?',
              [
                { text: 'Batal', style: 'cancel' },
                { 
                  text: 'Hapus', 
                  style: 'destructive',
                  onPress: () => {
                    clearCart();
                    Alert.alert('Berhasil', 'Keranjang dikosongkan');
                  }
                }
              ]
            );
          }}
        >
          <Text style={[styles.dangerButtonText, { color: theme.error }]}>
            Kosongkan Keranjang
          </Text>
        </TouchableOpacity>
      </View>

      {/* Social Media & Projects */}
      <View style={[styles.section, { backgroundColor: theme.card, marginBottom: 16 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🌟 Supported by Me
        </Text>
        
        <View style={styles.linkGroup}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/f.zvvn_/')}>
            <Text style={styles.linkItem}>📸 Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://tiktok.com/@www.tiktok.com/eksrovertselalu')}>
            <Text style={styles.linkItem}>🎵 TikTok</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/@zxyninety293')}>
            <Text style={styles.linkItem}>▶️ YouTube</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://discord.com/channels/@zxyninety')}>
            <Text style={styles.linkItem}>💬 Discord</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://t.me/Art_zwn')}>
            <Text style={styles.linkItem}>✈️ Telegram</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
          🚀 Project Lain Fhaz
        </Text>
        
        <View style={styles.linkGroup}>
          <TouchableOpacity onPress={() => Linking.openURL('https://globe3d-byfhaz.netlify.app/')}>
            <Text style={styles.linkItem}>🌍 Globe 3D</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://siswayangtidakmencolok-afk.github.io/website-frieren/')}>
            <Text style={styles.linkItem}>🧝‍♀️ Website Frieren</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://worldclockandtimer.netlify.app/')}>
            <Text style={styles.linkItem}>⏱️ World Clock & Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://student-registration-sage-delta.vercel.app/')}>
            <Text style={styles.linkItem}>📝 Register siswa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appInfoText, { color: theme.textSecondary }]}>
          FoodApp v1.0.0
        </Text>
        <Text style={[styles.appInfoText, { color: theme.textSecondary }]}>
          Made with ❤️ for learning
        </Text>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statRowLabel: {
    fontSize: 14,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  settingArrow: {
    fontSize: 24,
  },
  dangerButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appInfo: {
    padding: 20,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bottomSpace: {
    height: 30,
  },
  linkGroup: {
    marginTop: 8,
  },
  linkItem: {
    fontSize: 15,
    color: '#007AFF', // Tautan warna biru
    paddingVertical: 10,
    fontWeight: '500',
  },
});

export default ProfileScreen;