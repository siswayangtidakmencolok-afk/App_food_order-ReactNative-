import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Platform, Alert, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const STORE_NAMES = {
  'Makanan Utama': 'Warung Nasgor Akang Komplek',
  'Minuman': 'Minuman Segar Bang Jago',
  'Camilan': 'Camilan Enak Bu RT',
  'Dessert': 'Eskrim Whools Keliling',
  'default': 'Bakso Pak Kumis'
};

const getStoreName = (category) => STORE_NAMES[category] || STORE_NAMES['default'];

const CustomCheckbox = ({ checked, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.checkboxContainer}>
    <MaterialCommunityIcons 
      name={checked ? "checkbox-marked" : "checkbox-blank-outline"} 
      size={24} 
      color={checked ? "#ee4d2d" : "#8f7069"} 
    />
  </TouchableOpacity>
);

const CartScreen = ({ navigation }) => {
  const { cart, setCart, menuItems, orderHistory, isDarkMode } = useApp();
  
  const [selectedItems, setSelectedItems] = useState(new Set(cart.map(i => i.id)));

  const groupedCart = useMemo(() => {
    const groups = {};
    cart.forEach(item => {
      const storeName = getStoreName(item.category);
      if (!groups[storeName]) groups[storeName] = [];
      groups[storeName].push(item);
    });
    return Object.entries(groups).map(([storeName, items]) => ({ storeName, items }));
  }, [cart]);

  const handleIncrease = (itemId) => {
    setCart(cart.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const handleDecrease = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item.quantity > 1) {
      setCart(cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      Alert.alert('Hapus Item', 'Yakin ingin menghapus item ini?', [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => {
            setCart(cart.filter(i => i.id !== itemId));
            const newSelected = new Set(selectedItems);
            newSelected.delete(itemId);
            setSelectedItems(newSelected);
          }
        }
      ]);
    }
  };

  const toggleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) newSelected.delete(itemId);
    else newSelected.add(itemId);
    setSelectedItems(newSelected);
  };

  const toggleStoreSelect = (storeItems) => {
    const allSelected = storeItems.every(i => selectedItems.has(i.id));
    const newSelected = new Set(selectedItems);
    storeItems.forEach(i => {
      if (allSelected) newSelected.delete(i.id);
      else newSelected.add(i.id);
    });
    setSelectedItems(newSelected);
  };

  const toggleAll = () => {
    if (selectedItems.size === cart.length && cart.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map(i => i.id)));
    }
  };

  const selectedCartItems = cart.filter(item => selectedItems.has(item.id));
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      Alert.alert('Pilih Item', 'Silakan centang item yang ingin dibeli terlebih dahulu.');
      return;
    }
    navigation.navigate('Payment', { total: totalPrice, items: selectedCartItems });
  };

  const recommendations = useMemo(() => {
    const cartIds = new Set(cart.map(c => c.id));
    const available = menuItems.filter(m => !cartIds.has(m.id));
    return available.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [cart, menuItems]);

  const activeOrder = orderHistory.find(o => ['Pending', 'Preparing', 'Delivering'].includes(o.status));

  // Tema Gelap/Terang Colors
  const bgColor = isDarkMode ? '#121212' : '#f6f3f2';
  const surfaceColor = isDarkMode ? '#1e1e1e' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#1b1c1c';
  const textMuted = isDarkMode ? '#aaa' : '#5b403b';
  const borderColor = isDarkMode ? '#333' : '#e5e2e1';

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name="cart-outline" size={100} color="#ccc" style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: textColor }]}>Keranjang Kosong</Text>
        <Text style={styles.emptySub}>Yuk tambahkan menu favoritmu sekarang!</Text>
        <TouchableOpacity 
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.emptyBtnText}>Lihat Menu</Text>
        </TouchableOpacity>

        {activeOrder && (
          <TouchableOpacity 
            style={styles.activeOrderBtn}
            onPress={() => navigation.navigate('DeliveryTracker', { order: activeOrder })}
          >
            <LinearGradient colors={['#FF4B2B', '#FF416C']} style={styles.activeOrderGradient}>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#fff" />
              <Text style={styles.activeOrderText}>Pantau Pesanan Aktif</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const isAllSelected = cart.length > 0 && selectedItems.size === cart.length;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header Sticky */}
      <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ee4d2d" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Kantong Pesanan</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Ubah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Loop Store Groups */}
        {groupedCart.map((group, idx) => {
          const storeAllSelected = group.items.every(i => selectedItems.has(i.id));

          return (
            <View key={`store-${idx}`} style={[styles.storeCard, { backgroundColor: surfaceColor, borderColor }]}>
              {/* Store Header */}
              <View style={[styles.storeHeader, { borderBottomColor: borderColor }]}>
                <CustomCheckbox checked={storeAllSelected} onPress={() => toggleStoreSelect(group.items)} />
                <View style={styles.storeTitleWrap}>
                  <MaterialCommunityIcons name="store" size={20} color={textMuted} />
                  <Text style={[styles.storeTitle, { color: textColor }]}>{group.storeName}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                </View>
              </View>

              {/* Items */}
              {group.items.map(item => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemCheckWrap}>
                      <CustomCheckbox checked={isSelected} onPress={() => toggleItemSelect(item.id)} />
                    </View>
                    <View style={styles.itemImageWrap}>
                      <Image source={{ uri: item.image || item.image_url || 'https://via.placeholder.com/150' }} style={styles.itemImage} resizeMode="cover" />
                    </View>
                    <View style={styles.itemDetails}>
                      <View>
                        <Text style={[styles.itemName, { color: textColor }]} numberOfLines={2}>{item.name}</Text>
                        <View style={[styles.variantBadge, { backgroundColor: isDarkMode ? '#333' : '#f6f3f2' }]}>
                          <Text style={[styles.variantText, { color: textMuted }]}>Porsi: Standar</Text>
                          <MaterialCommunityIcons name="chevron-down" size={14} color={textMuted} />
                        </View>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.itemPrice}>Rp{item.price.toLocaleString('id-ID')}</Text>
                        {/* Stepper */}
                        <View style={[styles.stepper, { borderColor: borderColor }]}>
                          <TouchableOpacity onPress={() => handleDecrease(item.id)} style={[styles.stepperBtn, { backgroundColor: surfaceColor }]}>
                            <Text style={[styles.stepperBtnText, { color: textColor }]}>-</Text>
                          </TouchableOpacity>
                          <View style={[styles.stepperValueWrap, { borderColor: borderColor }]}>
                            <Text style={[styles.stepperValue, { color: textColor }]}>{item.quantity}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleIncrease(item.id)} style={[styles.stepperBtn, styles.stepperBtnAdd]}>
                            <Text style={styles.stepperBtnAddText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Voucher Banner */}
        <TouchableOpacity activeOpacity={0.8} style={[styles.voucherBanner, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.voucherLeft}>
            <View style={styles.voucherIconWrap}>
              <MaterialCommunityIcons name="ticket-percent" size={24} color="#ee4d2d" />
            </View>
            <View>
              <Text style={[styles.voucherTitle, { color: textColor }]}>Gunakan Voucher Makan</Text>
              <Text style={styles.voucherSub}>Hemat hingga Rp15.000 lagi!</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={textMuted} />
        </TouchableOpacity>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationSec}>
            <Text style={[styles.recommendationTitle, { color: textColor }]}>Rekomendasi Produk</Text>
            <View style={styles.recommendationGrid}>
              {recommendations.map((item, idx) => (
                <TouchableOpacity 
                  key={`rec-${item.id}-${idx}`} 
                  activeOpacity={0.9}
                  style={[styles.recCard, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={() => navigation.navigate('MenuDetail', { item })}
                >
                  <View style={styles.recImgWrap}>
                    <Image source={{ uri: item.image || item.image_url }} style={styles.recImg} resizeMode="cover" />
                  </View>
                  <View style={styles.recInfo}>
                    <Text style={[styles.recName, { color: textColor }]} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.recPriceRow}>
                      <Text style={styles.recPrice}>Rp{item.price.toLocaleString('id-ID')}</Text>
                      <Text style={styles.recSold}>Terjual {Math.floor(Math.random() * 50) + 10}0+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Checkout Bar */}
      <View style={[styles.bottomBar, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        <View style={styles.bottomBarInner}>
          <View style={styles.selectAllWrap}>
            <CustomCheckbox checked={isAllSelected} onPress={toggleAll} />
            <Text style={[styles.selectAllText, { color: textColor }]}>Semua</Text>
          </View>
          
          <View style={styles.checkoutWrap}>
            <View style={styles.totalWrap}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalPrice}>Rp{totalPrice.toLocaleString('id-ID')}</Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleCheckout}
              style={[styles.checkoutBtn, { backgroundColor: totalItemsCount > 0 ? '#ee4d2d' : '#a0a0a0' }]}
            >
              <Text style={styles.checkoutBtnText}>Checkout ({totalItemsCount})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  checkboxContainer: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 16, color: '#888', marginBottom: 32, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#ee4d2d', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  emptyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  activeOrderBtn: { marginTop: 24, width: '100%', maxWidth: 300, borderRadius: 16, overflow: 'hidden' },
  activeOrderGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, gap: 12 },
  activeOrderText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, zIndex: 50 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  editBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  editBtnText: { fontSize: 14, fontWeight: 'bold', color: '#ee4d2d' },
  
  scrollView: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  scrollContent: { paddingBottom: 150 },
  
  storeCard: { borderRadius: 12, marginBottom: 12, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1 },
  storeTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  storeTitle: { fontSize: 16, fontWeight: 'bold' },
  
  itemRow: { flexDirection: 'row', gap: 12, padding: 12 },
  itemCheckWrap: { justifyContent: 'center' },
  itemImageWrap: { width: 96, height: 96, backgroundColor: '#f0f0f0', borderRadius: 8, overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  itemDetails: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 14 },
  variantBadge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  variantText: { fontSize: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  itemPrice: { color: '#ee4d2d', fontWeight: 'bold', fontSize: 18 },
  
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 4, overflow: 'hidden' },
  stepperBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 18, fontWeight: 'bold' },
  stepperValueWrap: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderRightWidth: 1 },
  stepperValue: { fontWeight: '500' },
  stepperBtnAdd: { backgroundColor: '#ee4d2d' },
  stepperBtnAddText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  voucherBanner: { borderRadius: 12, padding: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voucherIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffebe6', alignItems: 'center', justifyContent: 'center' },
  voucherTitle: { fontSize: 16, fontWeight: 'bold' },
  voucherSub: { fontSize: 12, color: '#888', marginTop: 2 },
  
  recommendationSec: { marginBottom: 24 },
  recommendationTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  recommendationGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recCard: { width: '48%', borderRadius: 8, borderWidth: 1, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  recImgWrap: { aspectRatio: 1, backgroundColor: '#f0f0f0' },
  recImg: { width: '100%', height: '100%' },
  recInfo: { padding: 8, flex: 1, justifyContent: 'space-between' },
  recName: { fontSize: 14, marginBottom: 4 },
  recPriceRow: { marginTop: 8 },
  recPrice: { color: '#ee4d2d', fontWeight: 'bold', fontSize: 16 },
  recSold: { fontSize: 10, color: '#999', marginTop: 4 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
  bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 70 },
  selectAllWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { fontSize: 16 },
  checkoutWrap: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  totalWrap: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 12, color: '#888' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#ee4d2d' },
  checkoutBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CartScreen;