// src/screens/MenuScreen.js
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList, Image, Modal, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import SuccessAnimation from '../components/SuccessAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

// ─── Float Particle (fly to cart effect) ───────────────────────────────────
const FloatParticle = ({ emoji, onDone }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const { menuItems } = useApp();

  useState(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.5,
          friction: 3,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => onDone());
  });

  return (
    <Animated.Text style={{
      position: 'absolute',
      bottom: 40,
      right: 16,
      fontSize: 28,
      zIndex: 999,
      transform: [{ translateY }, { scale }],
      opacity,
      pointerEvents: 'none',
    }}>
      {emoji}
    </Animated.Text>
  );
};

// ─── Animated Add Button ────────────────────────────────────────────────────
const AddButton = ({ onPress, color }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.75,
        friction: 3,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1.15,
        friction: 3,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: false,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: color }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Tambah</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
const MenuScreen = ({ navigation }) => {
  const { addToCart, favorites, toggleFavorite, isDarkMode, menuItems } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [selectedCategory, setSelectedCategory]   = useState('Semua');
  const [searchQuery, setSearchQuery]             = useState('');
  const [sortBy, setSortBy]                       = useState('name-asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [priceRange]                              = useState({ min: 0, max: 100000 });
  const [showFilterModal, setShowFilterModal]     = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [particles, setParticles]                 = useState([]);

  // Success overlay scale animation
  const successScale = useRef(new Animated.Value(0)).current;

  const triggerSuccess = () => {
    setShowSuccessAnimation(true);
    Animated.sequence([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: false,
      }),
      Animated.delay(1000),
      Animated.timing(successScale, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => setShowSuccessAnimation(false));
  };

  const handleAddToCart = (item) => {
    addToCart(item);

    // Float particle
    const id = Date.now();
    setParticles(prev => [...prev, { id, emoji: '🛒' }]);

    // Success overlay
    triggerSuccess();
  };

  const removeParticle = (id) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  const categories  = ['Semua', 'Makanan Utama', 'Minuman'];
  const sortOptions = [
    { value: 'name-asc',    label: 'Nama A-Z' },
    { value: 'name-desc',   label: 'Nama Z-A' },
    { value: 'price-asc',   label: 'Termurah' },
    { value: 'price-desc',  label: 'Termahal' },
    { value: 'rating-desc', label: 'Rating Tertinggi' },
  ];

  const filteredMenu = useMemo(() => {
    let result = [...menuItems];
    if (selectedCategory !== 'Semua')
      result = result.filter(i => i.category === selectedCategory);
    if (searchQuery.trim())
      result = result.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (showFavoritesOnly)
      result = result.filter(i => favorites.includes(i.id));
    result = result.filter(i => i.price >= priceRange.min && i.price <= priceRange.max);
    switch (sortBy) {
      case 'name-asc':    result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc':   result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc':   result.sort((a, b) => a.price - b.price); break;
      case 'price-desc':  result.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly, priceRange, favorites, menuItems]);

  const renderStars = (rating) => '⭐'.repeat(Math.floor(rating));

  const FoodCard = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    const heartScale = useRef(new Animated.Value(1)).current;

    const handleFavorite = () => {
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.5, friction: 3, useNativeDriver: false }),
        Animated.spring(heartScale, { toValue: 1,   friction: 4, useNativeDriver: false }),
      ]).start();
      toggleFavorite(item.id);
    };

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Animated.View style={[styles.favoriteButton, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity onPress={handleFavorite}>
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.navigate('MenuDetail', { item })}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>{renderStars(item.rating)}</Text>
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {item.rating} ({item.totalReviews})
            </Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
            <AddButton
              onPress={() => handleAddToCart(item)}
              color={theme.primary}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Cari menu..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toolbar */}
      <View style={[styles.toolbarContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.toolbarIcon}>⚙️</Text>
          <Text style={[styles.toolbarText, { color: theme.text }]}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolbarButton, showFavoritesOnly && { backgroundColor: theme.secondary, borderRadius: 8 }]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Text style={styles.toolbarIcon}>❤️</Text>
          <Text style={[styles.toolbarText, { color: showFavoritesOnly ? '#fff' : theme.text }]}>Favorit</Text>
        </TouchableOpacity>
      </View>

      {/* Category */}
      <View style={[styles.categoryContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && { backgroundColor: theme.primary }]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && { color: '#fff' }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result count */}
      <View style={[styles.resultContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.resultText, { color: theme.textSecondary }]}>
          {filteredMenu.length} menu
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <FoodCard item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>Tidak ada menu ditemukan</Text>
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Filter & Urutkan</Text>
            <Text style={[styles.modalLabel, { color: theme.text }]}>Urutkan:</Text>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortOption, sortBy === opt.value && { backgroundColor: theme.primary }]}
                onPress={() => setSortBy(opt.value)}
              >
                <Text style={[styles.sortOptionText, { color: sortBy === opt.value ? '#fff' : theme.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.primary }]} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Float Particles */}
      {particles.map(p => (
        <FloatParticle key={p.id} emoji={p.emoji} onDone={() => removeParticle(p.id)} />
      ))}

      {/* Success Overlay */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
            <SuccessAnimation style={styles.successLottie} />
            <Text style={styles.successText}>Berhasil ditambahkan!</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  searchContainer:  { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchIcon:       { fontSize: 20, marginRight: 8 },
  searchInput:      { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, fontSize: 14 },
  clearButton:      { fontSize: 20, color: '#ff6347', fontWeight: 'bold', marginLeft: 8 },
  toolbarContainer: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  toolbarButton:    { flexDirection: 'row', alignItems: 'center', marginRight: 16, padding: 8 },
  toolbarIcon:      { fontSize: 18, marginRight: 6 },
  toolbarText:      { fontSize: 14, fontWeight: '600' },
  categoryContainer:{ flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  categoryButton:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f0f0f0' },
  categoryText:     { fontSize: 14, fontWeight: '500', color: '#666' },
  resultContainer:  { paddingHorizontal: 16, paddingVertical: 8 },
  resultText:       { fontSize: 13, fontStyle: 'italic' },
  listContainer:    { paddingVertical: 8, paddingBottom: 20 },
  card:             { borderRadius: 12, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
  favoriteButton:   { position: 'absolute', top: 12, right: 12, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
  favoriteIcon:     { fontSize: 24 },
  image:            { width: '100%', height: 150, resizeMode: 'cover' },
  infoContainer:    { padding: 12 },
  nameRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name:             { fontSize: 18, fontWeight: 'bold', flex: 1 },
  categoryBadge:    { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  description:      { fontSize: 13, marginBottom: 8 },
  ratingContainer:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingStars:      { fontSize: 12, marginRight: 4 },
  ratingText:       { fontSize: 12, fontWeight: '600' },
  bottomRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:            { fontSize: 16, fontWeight: 'bold', color: '#FF6347' },
  addButton:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText:    { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyContainer:   { padding: 60, alignItems: 'center' },
  emptyIcon:        { fontSize: 60, marginBottom: 16 },
  emptyText:        { fontSize: 18, fontWeight: 'bold' },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  modalTitle:       { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalLabel:       { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 12 },
  sortOption:       { padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: '#f5f5f5' },
  sortOptionText:   { fontSize: 15, fontWeight: '500' },
  modalButton:      { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  modalButtonText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  successContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  successLottie:    { width: 150, height: 150 },
  successText:      { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10 },
});

export default MenuScreen;