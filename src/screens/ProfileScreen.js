import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import GrainientBackground from '../components/GrainientBackground';
import LogoLoop from '../components/LogoLoop';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const AnimatedSection = ({ children, delay = 0, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View style={[{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
    }, style]}>
      {children}
    </Animated.View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const {
    userProfile, updateProfile, isDarkMode,
    toggleDarkMode, orderHistory, favorites,
    clearCart, signOut
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name:  userProfile?.name  || '',
    phone: userProfile?.phone || '',
  });

  // Colors mapped from HTML Tailwind config
  const colors = {
    background: isDarkMode ? '#121212' : '#fcf9f8',
    surface: isDarkMode ? '#1e1e1e' : '#fff8f4',
    surfaceContainerLowest: isDarkMode ? '#1a1a1a' : '#ffffff',
    surfaceContainerLow: isDarkMode ? '#252525' : '#fff1e6',
    onSurface: isDarkMode ? '#ffffff' : '#211a14',
    onSurfaceVariant: isDarkMode ? '#aaaaaa' : '#524536',
    primary: '#815200',
    primaryFixed: '#ffddb7',
    onPrimaryFixed: '#2a1700',
    secondaryContainer: '#fed3a1',
    onSecondaryContainer: '#785931',
    tertiaryFixed: '#c7e7ff',
    tertiary: '#00628a',
    outlineVariant: isDarkMode ? '#333333' : '#d6c3b0',
    errorContainer: isDarkMode ? '#4a0005' : '#ffdad6',
    onErrorContainer: isDarkMode ? '#ffb4ab' : '#93000a',
    error: '#ba1a1a',
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setTempProfile({
        name:  userProfile?.name  || '',
        phone: userProfile?.phone || '',
      });
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
    }
  };

  const handleSignOut = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut }
    ]);
  };

  if (!userProfile) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.onSurfaceVariant }}>Memuat profil...</Text>
    </View>
  );

  const totalOrders = orderHistory.length;
  const totalSpent  = orderHistory.reduce((s, o) => s + (o.total || 0), 0);
  const initials = (userProfile.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const getLoyaltyTier = () => {
    if (totalSpent > 1000000) return 'Gold Member';
    if (totalSpent > 300000)  return 'Silver Member';
    return 'Bronze Member';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.appBarLeft}>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialCommunityIcons name="cog" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* User Header Section with Background Animation */}
        <AnimatedSection delay={0}>
          <View style={styles.heroSection}>
            <View style={styles.grainientWrap}>
              <GrainientBackground 
                color1={isDarkMode ? "#FF2A00" : "#FF3D00"}
                color2={isDarkMode ? "#FF6200" : "#FF8C00"}
                color3={isDarkMode ? "#0A0A0A" : "#D84315"}
              />
            </View>
            
            <View style={styles.heroContent}>
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { borderColor: colors.primaryFixed }]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
                <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]} onPress={handleEditToggle}>
                  <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.heroName, { color: '#fff' }]}>{userProfile.name || 'Guest'}</Text>
              <Text style={[styles.heroEmail, { color: 'rgba(255,255,255,0.8)' }]}>{userProfile.email}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: colors.primaryFixed }]}>
                  <Text style={[styles.badgeTxt, { color: colors.onPrimaryFixed }]}>Member Aktif</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.secondaryContainer }]}>
                  <Text style={[styles.badgeTxt, { color: colors.onSecondaryContainer }]}>{getLoyaltyTier()}</Text>
                </View>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* Shopping Stats Bento Grid */}
        <AnimatedSection delay={100} style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <MaterialCommunityIcons name="shopping-outline" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{totalOrders}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Pesanan</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.primary} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{(totalSpent / 1000000).toFixed(1)}M</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Belanja</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
            <MaterialCommunityIcons name="cards-heart" size={24} color={colors.error} style={styles.statIcon} />
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Favorit</Text>
          </View>
        </AnimatedSection>

        {/* Informational Cards */}
        <AnimatedSection delay={200} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Informasi Profil</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={[styles.sectionActionBtn, { color: colors.primary, fontWeight: 'bold' }]}>Simpan</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleEditToggle}>
                <Text style={[styles.sectionActionBtn, { color: colors.primary }]}>Edit Profil</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.cardBlock, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.cardRow, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1 }]}>
              <MaterialCommunityIcons name="badge-account-horizontal-outline" size={22} color={colors.onSurfaceVariant} style={styles.cardRowIcon} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardRowLabel, { color: colors.onSurfaceVariant }]}>Nama Lengkap</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.inputField, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                    value={tempProfile.name}
                    onChangeText={v => setTempProfile(p => ({ ...p, name: v }))}
                  />
                ) : (
                  <Text style={[styles.cardRowValue, { color: colors.onSurface }]}>{userProfile.name}</Text>
                )}
              </View>
            </View>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="phone-outline" size={22} color={colors.onSurfaceVariant} style={styles.cardRowIcon} />
              <View style={styles.cardRowContent}>
                <Text style={[styles.cardRowLabel, { color: colors.onSurfaceVariant }]}>Nomor Telepon</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.inputField, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
                    value={tempProfile.phone}
                    onChangeText={v => setTempProfile(p => ({ ...p, phone: v }))}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={[styles.cardRowValue, { color: colors.onSurface }]}>{userProfile.phone || '-'}</Text>
                )}
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* App Settings */}
        <AnimatedSection delay={300} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="cog" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Pengaturan Aplikasi</Text>
            </View>
          </View>

          <View style={[styles.cardBlock, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={[styles.cardRow, { borderBottomColor: colors.outlineVariant, borderBottomWidth: 1, alignItems: 'center' }]}>
              <View style={styles.cardRowContentHorizontal}>
                <MaterialCommunityIcons name="weather-night" size={22} color={colors.onSurfaceVariant} style={styles.cardRowIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardRowValue, { color: colors.onSurface, fontWeight: '600' }]}>Mode Gelap (Dark Mode)</Text>
                  <Text style={[styles.cardRowLabel, { color: colors.onSurfaceVariant }]}>Beralih ke tampilan gelap yang elegan</Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#d6c3b0', true: colors.primary }}
                thumbColor={'#fff'}
              />
            </View>
            <TouchableOpacity 
              style={[styles.cardRow, { alignItems: 'center' }]}
              onPress={() => Alert.alert('Info', 'Notifikasi segera hadir!')}
            >
              <View style={styles.cardRowContentHorizontal}>
                <MaterialCommunityIcons name="bell-outline" size={22} color={colors.onSurfaceVariant} style={styles.cardRowIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardRowValue, { color: colors.onSurface, fontWeight: '600' }]}>Pemberitahuan</Text>
                  <Text style={[styles.cardRowLabel, { color: colors.onSurfaceVariant }]}>Kelola notifikasi pesanan dan promosi</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </TouchableOpacity>
          </View>
        </AnimatedSection>

        {/* Social Media Slider (Using LogoLoop as requested) */}
        <AnimatedSection delay={400} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Find Me Everywhere</Text>
            </View>
          </View>
          
          <View style={{ height: 60, justifyContent: 'center' }}>
            <LogoLoop
              speed={140}
              logoHeight={45}
              gap={40}
              fadeOut={true}
              fadeOutColor={colors.background}
              scaleOnHover={true}
              logos={[
                { node: <MaterialCommunityIcons name="github" size={30} color={isDarkMode ? "#fff" : "#211a14"} />, title: "GitHub", href: 'https://github.com/siswayangtidakmencolok-afk' },
                { node: <MaterialCommunityIcons name="whatsapp" size={30} color="#25D366" />, title: "WhatsApp", href: 'https://wa.me/qr/RKCJNQUSIH6VF1' },
                { node: <MaterialCommunityIcons name="instagram" size={30} color="#E1306C" />, title: "Instagram", href: 'https://www.instagram.com/f.zvvn_/' },
                { node: <MaterialCommunityIcons name="facebook" size={30} color="#1877F2" />, title: "Facebook", href: 'https://www.facebook.com/share/1QzXJnQtXt/' },
                { node: <MaterialCommunityIcons name="twitter" size={30} color={isDarkMode ? "#fff" : "#211a14"} />, title: "X", href: 'https://x.com/www.x.com/zxyninety1' },
                { node: <MaterialCommunityIcons name="telegram" size={30} color="#229ED9" />, title: "Telegram", href: 'https://t.me/Art_zwn' },
                { node: <MaterialCommunityIcons name="discord" size={30} color="#5865F2" />, title: "Discord", href: 'https://discord.com/channels/@zxyninety' },
              ]}
            />
          </View>
        </AnimatedSection>

        {/* My Projects List */}
        <AnimatedSection delay={500} style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Project Lainnya</Text>
            </View>
          </View>

          <View style={styles.projectGrid}>
            {[
              { label: 'Globe 3D',            url: 'https://globe3d-byfhaz.netlify.app/',                                    icon: 'earth', color: colors.tertiary, bg: colors.tertiaryFixed },
              { label: 'World Clock & Timer', url: 'https://worldclockandtimer.netlify.app/',                                icon: 'clock-outline', color: colors.primary, bg: colors.primaryFixed },
              { label: 'Teacher Absence',     url: 'https://teacher-absence-byfhaz.up.railway.app/',                        icon: 'account-group', color: '#785831', bg: colors.secondaryContainer },
              { label: 'Student Registration',url: 'https://student-registration-sage-delta.vercel.app/',                   icon: 'account-plus-outline', color: '#00628a', bg: '#c7e7ff' },
            ].map((project, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.projectCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}
                onPress={() => Linking.openURL(project.url)}
              >
                <View style={styles.projectCardLeft}>
                  <View style={[styles.projectIconBox, { backgroundColor: project.bg }]}>
                    <MaterialCommunityIcons name={project.icon} size={20} color={project.color} />
                  </View>
                  <Text style={[styles.projectName, { color: colors.onSurface }]}>{project.label}</Text>
                </View>
                <MaterialCommunityIcons name="open-in-new" size={18} color={colors.outlineVariant} />
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        {/* Logout Action */}
        <AnimatedSection delay={600} style={styles.logoutSection}>
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: colors.errorContainer }]}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.onErrorContainer} />
            <Text style={[styles.logoutBtnTxt, { color: colors.onErrorContainer }]}>Logout Account</Text>
          </TouchableOpacity>
          <Text style={[styles.logoutNote, { color: colors.onSurfaceVariant }]}>
            Kosongkan Keranjang Belanja sebelum Logout.
          </Text>

          {/* Secret Clear Cart (Hidden under text, or you can add a real button) */}
          <TouchableOpacity onPress={() => {
            Alert.alert('Kosongkan Keranjang', 'Hapus semua item?', [
              { text: 'Batal', style: 'cancel' },
              { text: 'Hapus', style: 'destructive', onPress: () => { clearCart(); Alert.alert('Berhasil', 'Keranjang dikosongkan'); } }
            ]);
          }} style={{ padding: 10, alignSelf: 'center', marginTop: 10 }}>
            <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, textDecorationLine: 'underline' }}>Kosongkan Keranjang</Text>
          </TouchableOpacity>
        </AnimatedSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 8,
    marginRight: -8,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 30,
  },
  grainientWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#815200',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeTxt: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionActionBtn: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBlock: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  cardRowIcon: {
    marginTop: 2,
  },
  cardRowContent: {
    flex: 1,
  },
  cardRowContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardRowLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  cardRowValue: {
    fontSize: 14,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    marginTop: 4,
  },
  projectGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  projectCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutBtnTxt: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProfileScreen;