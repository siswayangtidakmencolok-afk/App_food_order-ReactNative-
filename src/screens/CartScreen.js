import React, { useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';

const CartScreen = ({ navigation }) => {
  const { cart, setCart, orderHistory, setOrderHistory } = useApp();

  console.log('Cart di CartScreen:', cart);  // ← TAMBAH INI
  console.log('Jumlah item:', cart.length);   // ← TAMBAH INI
  

  const handleIncrease = (itemId) => {
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  };

  const handleDecrease = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      handleRemove(itemId);
    }
  };

  const handleRemove = (itemId) => {
    Alert.alert(
      'Hapus Item',
      'Yakin ingin menghapus item ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => setCart(cart.filter(item => item.id !== itemId))
        }
      ]
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan menu terlebih dahulu');
      return;
    }

    // Navigasi ke Payment Screen
    navigation.navigate('Payment', { 
      total: calculateTotal()
    });
  };

  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          Rp {item.price.toLocaleString('id-ID')}
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleDecrease(item.id)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleIncrease(item.id)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>
          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
        </Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
        >
          <Text style={styles.removeText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    const activeOrder = orderHistory.find(o => ['Pending', 'Preparing', 'Delivering'].includes(o.status));

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Keranjang Kosong</Text>
        <Text style={styles.emptySubtext}>Yuk tambahkan menu favorit!</Text>
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.menuButtonText}>Lihat Menu</Text>
        </TouchableOpacity>

        {activeOrder && (
          <TouchableOpacity 
            style={[styles.trackButton, { marginTop: 20 }]}
            onPress={() => navigation.navigate('DeliveryTracker', { order: activeOrder })}
          >
            <LinearGradient colors={['#FF4B2B', '#FF416C']} style={styles.trackGradient}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#fff" />
              <Text style={styles.trackButtonText}>Pantau Pesanan Aktif</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: Platform.OS !== 'web',
  }).start();
}, []);

  const AnimatedCartItemWrapper = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [index]);
    
    const translateY = itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
    
    return (
      <Animated.View style={{ opacity: itemAnim, transform: [{ translateY }] }}>
        <CartItem item={item} />
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
  {/* Header UI with gradient */}
  <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.header}>
    <MaterialCommunityIcons name="truck-delivery" size={32} color="#fff" />
    <Text style={styles.headerTitle}>Keranjang Belanja</Text>
    <MaterialCommunityIcons name="receipt" size={32} color="#fff" />
  </LinearGradient>
  <Animated.FlatList
    data={cart}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item, index }) => <AnimatedCartItemWrapper item={item} index={index} />}
    contentContainerStyle={styles.listContainer}
  />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            Rp {calculateTotal().toLocaleString('id-ID')}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Lanjut Pembayaran →</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FF6347',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 200,
  },
  cartItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FF6347',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  checkoutButton: {
    backgroundColor: '#FF6347',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  menuButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackButton: {
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  trackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CartScreen;