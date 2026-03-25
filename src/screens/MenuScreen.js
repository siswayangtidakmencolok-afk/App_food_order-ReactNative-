import { useMemo, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Animated,
  Dimensions,
  Image, Modal,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import SuccessAnimation from '../components/SuccessAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const COL_GAP   = 10;
const PADDING    = 14;
const COL_WIDTH  = (width - PADDING * 2 - COL_GAP) / 2;

// ─── Float Particle ──────────────────────────────────────────
const FloatParticle = ({ onDone }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(0.5)).current;

  useState(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -160, duration: 900, useNativeDriver: false }),
      Animated.timing(opacity,    { toValue: 0,    duration: 900, useNativeDriver: false }),
      Animated.spring(scale,      { toValue: 1.8,  friction: 3,   useNativeDriver: false }),
    ]).start(() => onDone());
  });

  return (
    <Animated.Text style={{
      position: 'absolute', bottom: 80, right: 24,
      fontSize: 28, zIndex: 999,
      transform: [{ translateY }, { scale }],
      opacity, pointerEvents: 'none',
    }}>🛒</Animated.Text>
  );
};

// ─── Pin Card (Pinterest style) ───────────────────────────────
const PinCard = ({ item, theme, onAddToCart, onToggleFavorite, onPress, isFavorite, tall }) => {
  const heartScale = useRef(new Animated.Value(1)).current;
  const cardScale  = useRef(new Animated.Value(1)).current;
  const imgHeight  = tall ? 240 : 160;

  const handleFavorite = (e) => {
    e.stopPropagation?.();
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.7, friction: 3, useNativeDriver: false }),
      Animated.spring(heartScale, { toValue: 1,   friction: 4, useNativeDriver: false }),
    ]).start();
    onToggleFavorite(item.id);
  };

  const handlePressIn  = () => Animated.spring(cardScale, { toValue: 0.96, friction: 6, useNativeDriver: false }).start();
  const handlePressOut = () => Animated.spring(cardScale, { toValue: 1,    friction: 4, useNativeDriver: false }).start();

  return (
    <Animated.View style={[styles.pin, { backgroundColor: theme.card, transform: [{ scale: cardScale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
        {/* Image */}
        <View style={[styles.pinImgWrap, { height: imgHeight }]}>
          <Image source={{ uri: item.image }} style={styles.pinImg} />

          {/* Dark scrim bottom */}
          <View style={styles.pinScrim} />

          {/* Category */}
          <View style={[styles.pinCat, { backgroundColor: theme.primary }]}>
            <Text style={styles.pinCatTxt}>
              {item.category === 'Minuman' ? '🥤' : '🍽️'} {item.category}
            </Text>
          </View>

          {/* Heart */}
          <Animated.View style={[styles.pinHeart, { transform: [{ scale: heartScale }] }]}>
            <TouchableOpacity onPress={handleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 20 }}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Rating */}
          <View style={styles.pinRating}>
            <Text style={styles.pinRatingTxt}>⭐ {item.rating}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.pinBody}>
          <Text style={[styles.pinName, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.pinDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          <View style={styles.pinFooter}>
            <Text style={styles.pinPrice}>Rp {(item.price || 0).toLocaleString('id-ID')}</Text>
            <TouchableOpacity
              style={[styles.pinAddBtn, { backgroundColor: theme.primary }]}
              onPress={(e) => { e.stopPropagation?.(); onAddToCart(item); }}
            >
              <Text style={styles.pinAddTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Masonry Grid ─────────────────────────────────────────────
const MasonryGrid = ({ data, theme, onAddToCart, onToggleFavorite, onPress, favorites }) => {
  // Split into 2 columns
  const left  = data.filter((_, i) => i % 2 === 0);
  const right = data.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.grid}>
      {/* Left column */}
      <View style={styles.col}>
        {left.map((item, i) => (
          <PinCard
            key={item.id}
            item={item}
            theme={theme}
            tall={i % 3 === 0}
            isFavorite={favorites.includes(item.id)}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            onPress={() => onPress(item)}
          />
        ))}
      </View>

      {/* Right column — offset start untuk masonry feel */}
      <View style={[styles.col, { marginTop: 24 }]}>
        {right.map((item, i) => (
          <PinCard
            key={item.id}
            item={item}
            theme={theme}
            tall={i % 3 === 1}
            isFavorite={favorites.includes(item.id)}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            onPress={() => onPress(item)}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const MenuScreen = ({ navigation }) => {
  const { addToCart, favorites, toggleFavorite, isDarkMode, menuItems, menuLoading } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [selectedCategory, setSelectedCategory]           = useState('Semua');
  const [searchQuery, setSearchQuery]                     = useState('');
  const [sortBy, setSortBy]                               = useState('name-asc');
  const [showFavoritesOnly, setShowFavoritesOnly]         = useState(false);
  const [showFilterModal, setShowFilterModal]             = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation]   = useState(false);
  const [particles, setParticles]                         = useState([]);
  const successScale = useRef(new Animated.Value(0)).current;

  const triggerSuccess = () => {
    setShowSuccessAnimation(true);
    Animated.sequence([
      Animated.spring(successScale, { toValue: 1, friction: 4, useNativeDriver: false }),
      Animated.delay(900),
      Animated.timing(successScale, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => setShowSuccessAnimation(false));
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    setParticles(prev => [...prev, { id: Date.now() }]);
    triggerSuccess();
  };

  const categories  = ['Semua', 'Makanan Utama', 'Minuman'];
  const sortOptions = [
    { value: 'name-asc',    label: '🔤 Nama A-Z' },
    { value: 'name-desc',   label: '🔤 Nama Z-A' },
    { value: 'price-asc',   label: '💸 Termurah' },
    { value: 'price-desc',  label: '💎 Termahal' },
    { value: 'rating-desc', label: '⭐ Rating Tertinggi' },
  ];

  const filteredMenu = useMemo(() => {
    let result = [...(menuItems || [])];
    if (selectedCategory !== 'Semua') result = result.filter(i => i.category === selectedCategory);
    if (searchQuery.trim()) result = result.filter(i =>
      i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (showFavoritesOnly) result = result.filter(i => favorites.includes(i.id));
    switch (sortBy) {
      case 'name-asc':    result.sort((a, b) => a.name?.localeCompare(b.name)); break;
      case 'name-desc':   result.sort((a, b) => b.name?.localeCompare(a.name)); break;
      case 'price-asc':   result.sort((a, b) => a.price - b.price); break;
      case 'price-desc':  result.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly, favorites, menuItems]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Logo Header */}
      <View style={styles.menuHeader}>
        <MaterialCommunityIcons name="food" size={32} color={theme.primary} />
        <Text style={styles.menuHeaderTitle}>Aplikasi Pemesanan Makanan</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* ── Sticky Header ── */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          {/* Search */}
          <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Cari makanan favoritmu..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: theme.textSecondary, fontSize: 18, paddingLeft: 8 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category chips + filter */}
          <View style={styles.chipRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, { backgroundColor: theme.card }, selectedCategory === cat && { backgroundColor: theme.primary }]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipTxt, { color: theme.textSecondary }, selectedCategory === cat && { color: '#fff' }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: theme.card }, showFavoritesOnly && { backgroundColor: '#e74c3c' }]}
                onPress={() => setShowFavoritesOnly(f => !f)}
              >
                <Text style={[styles.chipTxt, { color: theme.textSecondary }, showFavoritesOnly && { color: '#fff' }]}>
                  ❤️ Favorit
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.card }]} onPress={() => setShowFilterModal(true)}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Count */}
          <Text style={[styles.countTxt, { color: theme.textSecondary }]}>
            {menuLoading ? 'Memuat...' : `${filteredMenu.length} menu`}
          </Text>
        </View>

        {/* ── Content ── */}
        {menuLoading ? (
          <View style={styles.loadingBox}>
            <Text style={{ fontSize: 56 }}>🍔</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 15 }}>Memuat menu...</Text>
          </View>
        ) : filteredMenu.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 56 }}>🍽️</Text>
            <Text style={[styles.emptyTxt, { color: theme.text }]}>Tidak ada menu</Text>
          </View>
        ) : (
          <MasonryGrid
            data={filteredMenu}
            theme={theme}
            favorites={favorites}
            onAddToCart={handleAddToCart}
            onToggleFavorite={toggleFavorite}
            onPress={(item) => navigation.navigate('MenuDetail', { item })}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Filter Modal ── */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Urutkan Menu</Text>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortRow, sortBy === opt.value && { backgroundColor: theme.primary + '18' }]}
                onPress={() => { setSortBy(opt.value); setShowFilterModal(false); }}
              >
                <Text style={[styles.sortTxt, { color: theme.text }, sortBy === opt.value && { color: theme.primary, fontWeight: 'bold' }]}>
                  {opt.label}
                </Text>
                {sortBy === opt.value && <Text style={{ color: theme.primary, fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Particles ── */}
      {particles.map(p => (
        <FloatParticle key={p.id} onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))} />
      ))}

      {/* ── Success ── */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <SuccessAnimation style={{ width: 90, height: 90 }} />
            <Text style={styles.successTxt}>Ditambahkan! 🎉</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },

  // Header
  header: {
    paddingVertical: 8,
    paddingHorizontal: PADDING,
    zIndex: 10
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FF6347',
  },
  menuHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  searchBar:      { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  searchInput:    { flex: 1, fontSize: 14 },
  chipRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  chipTxt:        { fontSize: 13, fontWeight: '600' },
  filterBtn:      { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  countTxt:       { fontSize: 12, fontStyle: 'italic', marginBottom: 8, marginLeft: 2 },

  // Masonry
  grid:           { flexDirection: 'row', paddingHorizontal: PADDING, gap: COL_GAP },
  col:            { width: COL_WIDTH },

  // Pin card
  pin:            { borderRadius: 18, marginBottom: COL_GAP, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  pinImgWrap:     { position: 'relative', width: '100%' },
  pinImg:         { width: '100%', height: '100%', resizeMode: 'cover' },
  pinScrim:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0)', backgroundImage: 'linear-gradient(transparent 40%, rgba(0,0,0,0.5))' },
  pinCat:         { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  pinCatTxt:      { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  pinHeart:       { position: 'absolute', top: 6, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  pinRating:      { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  pinRatingTxt:   { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  pinBody:        { padding: 10 },
  pinName:        { fontSize: 13, fontWeight: '800', marginBottom: 4, lineHeight: 18 },
  pinDesc:        { fontSize: 11, lineHeight: 15, marginBottom: 8 },
  pinFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pinPrice:       { fontSize: 13, fontWeight: 'bold', color: '#FF6347' },
  pinAddBtn:      { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  pinAddTxt:      { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 22 },

  // Loading / empty
  loadingBox:     { paddingTop: 80, alignItems: 'center' },
  emptyBox:       { paddingTop: 80, alignItems: 'center' },
  emptyTxt:       { fontSize: 18, fontWeight: 'bold', marginTop: 12 },

  // Modal
  modalBg:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  sheetHandle:    { width: 36, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle:     { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  sortRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 4 },
  sortTxt:        { fontSize: 15 },

  // Success
  successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  successCard:    { backgroundColor: '#fff', padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  successTxt:     { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 8 },
});

export default MenuScreen;