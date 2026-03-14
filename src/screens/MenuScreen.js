// src/screens/MenuScreen.js - SUPER ADVANCED VERSION
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import LottieView from 'lottie-react-native';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';
import { menuData } from '../data/menuData';

const MenuScreen = ({ navigation }) => {
  const { addToCart, favorites, toggleFavorite, isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  // GANTI JADI INI (tanpa setPriceRange):
const [priceRange] = useState({ min: 0, max: 100000 });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleAddToCart = (item) => {
    addToCart(item);
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 1500); // Hide animation after 1.5 seconds
  };

  const categories = ['Semua', 'Makanan Utama', 'Minuman'];
  const sortOptions = [
    { value: 'name-asc', label: 'Nama A-Z' },
    { value: 'name-desc', label: 'Nama Z-A' },
    { value: 'price-asc', label: 'Termurah' },
    { value: 'price-desc', label: 'Termahal' },
    { value: 'rating-desc', label: 'Rating Tertinggi' },
  ];

  // Advanced filtering & sorting
  const filteredMenu = useMemo(() => {
    let result = [...menuData];

    // Filter by category
    if (selectedCategory !== 'Semua') {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by favorites only
    if (showFavoritesOnly) {
      result = result.filter(item => favorites.includes(item.id));
    }

    // Filter by price range
    result = result.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly, priceRange, favorites]);

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  const FoodCard = ({ item }) => {
    const isFavorite = favorites.includes(item.id);
    
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>

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
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>+ Tambah</Text>
            </TouchableOpacity>
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

      {/* Filter & Sort Bar */}
      <View style={[styles.toolbarContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.toolbarIcon}>⚙️</Text>
          <Text style={[styles.toolbarText, { color: theme.text }]}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.toolbarButton,
            showFavoritesOnly && { backgroundColor: theme.secondary, borderRadius: 8 }
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Text style={styles.toolbarIcon}>❤️</Text>
          <Text style={[
            styles.toolbarText, 
            { color: showFavoritesOnly ? '#fff' : theme.text }
          ]}>
            Favorit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={[styles.categoryContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && { color: '#fff' }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result Info */}
      <View style={[styles.resultContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.resultText, { color: theme.textSecondary }]}>
          {filteredMenu.length} menu
        </Text>
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <FoodCard item={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Tidak ada menu ditemukan
            </Text>
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Filter & Urutkan
            </Text>

            <Text style={[styles.modalLabel, { color: theme.text }]}>Urutkan:</Text>
            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && { backgroundColor: theme.primary }
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={[
                  styles.sortOptionText,
                  { color: sortBy === option.value ? '#fff' : theme.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.modalButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <View style={styles.successContainer}>
            {Platform.OS !== 'web' ? (
              <LottieView
                source={require('../assets/lottie/success.json')}
                autoPlay
                loop={false}
                style={styles.successLottie}
              />
            ) : (
               <Text style={{fontSize: 50, marginBottom: 10}}>✅</Text>
            )}
            <Text style={styles.successText}>Berhasil ditambahkan!</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  clearButton: {
    fontSize: 20,
    color: '#ff6347',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  toolbarContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
  },
  toolbarIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  resultContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  sortOption: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  successLottie: {
    width: 150,
    height: 150,
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
});

export default MenuScreen;