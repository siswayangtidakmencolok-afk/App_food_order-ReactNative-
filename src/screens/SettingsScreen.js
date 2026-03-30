import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView, StyleSheet, Switch,
  Text, TouchableOpacity, View
} from 'react-native';
import AnimatedAvatarBorder from '../components/AnimatedAvatarBorder';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ACCENT_COLORS = [
  { color: '#FF6347', label: 'Tomat' },
  { color: '#FF3B30', label: 'Merah' },
  { color: '#FF9500', label: 'Oranye' },
  { color: '#FFCC00', label: 'Kuning' },
  { color: '#34C759', label: 'Hijau' },
  { color: '#00C7BE', label: 'Teal' },
  { color: '#007AFF', label: 'Biru' },
  { color: '#AF52DE', label: 'Ungu' },
];

const TEXT_SIZES = [
  { value: 'small',  label: 'Kecil',  preview: 12 },
  { value: 'normal', label: 'Normal', preview: 15 },
  { value: 'large',  label: 'Besar',  preview: 18 },
];

const SettingSection = ({ title, children, accentColor, isDarkMode }) => {
  const card    = isDarkMode ? '#161616' : '#fff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const border  = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  return (
    <View style={[styles.section, { backgroundColor: card, borderColor: border }]}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionAccentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.sectionTitle, { color: textCol }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const SettingRow = ({ icon, label, desc, right, accentColor, isDarkMode, isLast = false }) => {
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const subText = isDarkMode ? '#666' : '#999';
  const border  = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: border }]}>
      <View style={[styles.rowIconBox, { backgroundColor: accentColor + '22' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: textCol }]}>{label}</Text>
        {desc && <Text style={[styles.rowDesc, { color: subText }]}>{desc}</Text>}
      </View>
      <View style={styles.rowRight}>{right}</View>
    </View>
  );
};

export default function SettingsScreen() {
  const {
    isDarkMode, toggleDarkMode,
    accentColor, changeAccentColor,
    textSize, changeTextSize,
    userProfile, signOut,
    clearOrderHistory,
  } = useApp();

  const bg      = isDarkMode ? '#0a0a0a' : '#f0f2f5';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const subText = isDarkMode ? '#555'    : '#aaa';

  const fadeAnims  = [0,1,2,3].map(() => useRef(new Animated.Value(0)).current);
  const slideAnims = [0,1,2,3].map(() => useRef(new Animated.Value(30)).current);

  useEffect(() => {
    fadeAnims.forEach((anim, i) => {
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1, duration: 400, delay: i * 120, useNativeDriver: false,
        }),
        Animated.spring(slideAnims[i], {
          toValue: 0, friction: 7, delay: i * 120, useNativeDriver: false,
        }),
      ]).start();
    });
  }, []);

  const initials = (userProfile?.name || 'U')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fadeAnims[0] }]}>
        <View style={[styles.heroBg, { backgroundColor: accentColor + '18' }]} />
        <View style={[styles.heroAccentCircle, { backgroundColor: accentColor + '10' }]} />
        <AnimatedAvatarBorder initials={initials} size={120} accentColor={accentColor} />
        <Text style={[styles.heroName, { color: textCol }]}>{userProfile?.name || 'User'}</Text>
        <Text style={[styles.heroEmail, { color: subText }]}>{userProfile?.email || ''}</Text>
        <View style={[styles.heroBadge, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <View style={[styles.heroBadgeDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.heroBadgeTxt, { color: accentColor }]}>Tema Aktif</Text>
        </View>
      </Animated.View>

      {/* Section 1 — Warna */}
      <Animated.View style={{ opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }] }}>
        <SettingSection title="🎨 Warna Tema" accentColor={accentColor} isDarkMode={isDarkMode}>
          <Text style={[styles.colorHint, { color: subText }]}>
            Warna aksen yang tampil di seluruh aplikasi
          </Text>
          <View style={styles.colorGrid}>
            {ACCENT_COLORS.map(({ color, label }) => {
              const isSelected = accentColor === color;
              return (
                <TouchableOpacity key={color} style={styles.colorItemWrap} onPress={() => changeAccentColor(color)}>
                  <View style={[styles.colorCircle, { backgroundColor: color }, isSelected && styles.colorCircleSelected]}>
                    {isSelected && <Text style={styles.colorCheck}>✓</Text>}
                  </View>
                  <Text style={[styles.colorLabel, { color: subText }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.colorPreviewBar, { backgroundColor: accentColor }]}>
            <Text style={styles.colorPreviewTxt}>Preview Warna Tema</Text>
            <View style={styles.colorPreviewDots}>
              {[0.3, 0.6, 1].map((op, i) => (
                <View key={i} style={[styles.colorPreviewDot, { backgroundColor: `rgba(255,255,255,${op})` }]} />
              ))}
            </View>
          </View>
        </SettingSection>
      </Animated.View>

      {/* Section 2 — Ukuran Teks */}
      <Animated.View style={{ opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }] }}>
        <SettingSection title="🔤 Ukuran Teks" accentColor={accentColor} isDarkMode={isDarkMode}>
          <View style={styles.textSizeRow}>
            {TEXT_SIZES.map(({ value, label, preview }) => {
              const isSelected = textSize === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[styles.textSizeCard, {
                    borderColor:     isSelected ? accentColor : 'transparent',
                    backgroundColor: isSelected ? accentColor + '18' : (isDarkMode ? '#222' : '#f5f5f5'),
                  }]}
                  onPress={() => changeTextSize(value)}
                >
                  <Text style={[styles.textSizePreview, {
                    fontSize: preview,
                    color:    isSelected ? accentColor : (isDarkMode ? '#f0f0f0' : '#333'),
                  }]}>Aa</Text>
                  <Text style={[styles.textSizeLabel, { color: isSelected ? accentColor : subText }]}>{label}</Text>
                  {isSelected && <View style={[styles.textSizeDot, { backgroundColor: accentColor }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={[styles.textPreviewBox, { backgroundColor: isDarkMode ? '#222' : '#f5f5f5' }]}>
            <Text style={[styles.textPreviewLabel, { color: subText }]}>Preview:</Text>
            <Text style={[styles.textPreviewContent, {
              color:    textCol,
              fontSize: TEXT_SIZES.find(t => t.value === textSize)?.preview || 15,
            }]}>
              FoodsStreets — Makanan favoritmu
            </Text>
          </View>
        </SettingSection>
      </Animated.View>

      {/* Section 3 — Tampilan & Akun */}
      <Animated.View style={{ opacity: fadeAnims[3], transform: [{ translateY: slideAnims[3] }] }}>
        <SettingSection title="✨ Tampilan & Akun" accentColor={accentColor} isDarkMode={isDarkMode}>
          <SettingRow
            icon="🌙"
            label="Mode Gelap"
            desc="Nyaman di mata saat malam hari"
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            right={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#ddd', true: accentColor + '88' }}
                thumbColor={isDarkMode ? accentColor : '#f4f3f4'}
              />
            }
          />
          <SettingRow
            icon="🗑️"
            label="Hapus Riwayat"
            desc="Bersihkan semua riwayat pesanan"
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            right={
              <TouchableOpacity
                style={[styles.dangerBtn, { borderColor: '#ff4444' }]}
                onPress={() => Alert.alert('Hapus Riwayat', 'Yakin hapus semua riwayat pesanan?', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Hapus', style: 'destructive', onPress: clearOrderHistory },
                ])}
              >
                <Text style={styles.dangerBtnTxt}>Hapus</Text>
              </TouchableOpacity>
            }
          />
          <SettingRow
            icon="🚪"
            label="Keluar Akun"
            desc="Logout dari FoodsStreets"
            accentColor={accentColor}
            isDarkMode={isDarkMode}
            isLast
            right={
              <TouchableOpacity
                style={[styles.dangerBtn, { borderColor: '#ff4444' }]}
                onPress={() => Alert.alert('Keluar', 'Yakin ingin keluar?', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Keluar', style: 'destructive', onPress: signOut },
                ])}
              >
                <Text style={styles.dangerBtnTxt}>Keluar</Text>
              </TouchableOpacity>
            }
          />
        </SettingSection>
      </Animated.View>

      <View style={styles.appInfo}>
        <Text style={[styles.appVer, { color: subText }]}>FoodsStreets v1.0.0</Text>
        <Text style={[styles.appVer, { color: subText }]}>by fhaz • dibuat Untuk tugas sekolah</Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  hero:                { alignItems: 'center', paddingTop: 32, paddingBottom: 28, position: 'relative', overflow: 'hidden' },
  heroBg:              { ...StyleSheet.absoluteFillObject },
  heroAccentCircle:    { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -80 },
  heroName:            { fontSize: 22, fontWeight: '900', marginTop: 16, marginBottom: 4 },
  heroEmail:           { fontSize: 13, marginBottom: 12 },
  heroBadge:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  heroBadgeDot:        { width: 6, height: 6, borderRadius: 3 },
  heroBadgeTxt:        { fontSize: 12, fontWeight: '700' },
  section:             { marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  sectionTitleRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionAccentBar:    { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionTitle:        { fontSize: 15, fontWeight: '800' },
  colorHint:           { fontSize: 12, marginBottom: 16 },
  colorGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  colorItemWrap:       { alignItems: 'center', gap: 5 },
  colorCircle:         { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorCircleSelected: { borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  colorCheck:          { color: '#fff', fontSize: 16, fontWeight: '900' },
  colorLabel:          { fontSize: 10, fontWeight: '500' },
  colorPreviewBar:     { borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  colorPreviewTxt:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  colorPreviewDots:    { flexDirection: 'row', gap: 5 },
  colorPreviewDot:     { width: 8, height: 8, borderRadius: 4 },
  textSizeRow:         { flexDirection: 'row', gap: 10, marginBottom: 14 },
  textSizeCard:        { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 2, position: 'relative' },
  textSizePreview:     { fontWeight: '900', marginBottom: 4 },
  textSizeLabel:       { fontSize: 11, fontWeight: '600' },
  textSizeDot:         { position: 'absolute', bottom: 6, width: 5, height: 5, borderRadius: 2.5 },
  textPreviewBox:      { borderRadius: 10, padding: 12 },
  textPreviewLabel:    { fontSize: 10, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  textPreviewContent:  { fontWeight: '500' },
  row:                 { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowIconBox:          { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowText:             { flex: 1 },
  rowLabel:            { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  rowDesc:             { fontSize: 12 },
  rowRight:            { alignItems: 'flex-end' },
  dangerBtn:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
  dangerBtnTxt:        { color: '#ff4444', fontSize: 13, fontWeight: '700' },
  appInfo:             { alignItems: 'center', paddingVertical: 20 },
  appVer:              { fontSize: 12, marginBottom: 3 },
});