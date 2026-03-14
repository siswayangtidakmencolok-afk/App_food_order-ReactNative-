import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

const nearbyStores = [
  { id: '1', name: 'Warteg Bahari', distance: '0.5 km', rating: 4.5, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
  { id: '2', name: 'Sate Khas Senayan', distance: '1.2 km', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80' },
  { id: '3', name: 'Ayam Geprek Bensu', distance: '2.0 km', rating: 4.2, image: 'https://images.unsplash.com/photo-1626804475297-41609ea0ebb3?w=500&q=80' },
  { id: '4', name: 'Nasi Goreng Gila', distance: '2.5 km', rating: 4.6, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selamat Datang!</Text>
        <Text style={styles.subtitle}>Mau pesan makanan apa hari ini?</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#FF6347' }]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.cardIcon}>🍔</Text>
          <Text style={styles.cardTitle}>Lihat Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cardIcon}>🛒</Text>
          <Text style={styles.cardTitle}>Keranjang</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📍 Toko di Sekitar Anda</Text>
        
        {/* Fake Map */}
        <View style={styles.mapContainer}>
          <Image 
            source={{ uri: 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg' }} 
            style={styles.fakeMapImage}
          />
          <View style={styles.mapOverlay}>
            <Text style={styles.mapPin}>🎯 Lokasi Anda</Text>
          </View>
        </View>

        {/* Nearby Stores List */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeList}>
          {nearbyStores.map(store => (
            <View key={store.id} style={styles.storeCard}>
              <Image source={{ uri: store.image }} style={styles.storeImage} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.storeMeta}>
                  <Text style={styles.storeDistance}>🚶 {store.distance}</Text>
                  <Text style={styles.storeRating}>⭐ {store.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6347',
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  cardContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  fakeMapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    backgroundColor: '#FF6347',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  storeList: {
    flexDirection: 'row',
  },
  storeCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  storeImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  storeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeDistance: {
    fontSize: 12,
    color: '#666',
  },
  storeRating: {
    fontSize: 12,
    color: '#FF6347',
    fontWeight: 'bold',
  },
});

export default HomeScreen;