import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const DeliveryTrackerScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const { isDarkMode } = useApp();
  const getInitialTab = () => {
    if (order.status === 'Delivered') return 'Selesai';
    if (order.status === 'Delivering') return 'Akan diterima';
    if (order.status === 'Processing') return 'Untuk dikirim';
    if (order.paymentMethod === 'Cash on Delivery (COD)' && order.status === 'Pending') return 'Untuk dikirim';
    return 'Perlu dibayar';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Tampilan warna
  const bg = isDarkMode ? '#121212' : '#f5f5f5';
  const cardBg = isDarkMode ? '#1e1e1e' : '#fff';
  const textPrimary = isDarkMode ? '#fff' : '#000';
  const textSecondary = isDarkMode ? '#aaa' : '#666';

  const TABS = ['Perlu dibayar', 'Untuk dikirim', 'Akan diterima', 'Selesai'];

  const recommendations = [
    { id: '991', name: 'Paket Nasi Ayam Geprek Spesial', price: 25000, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80', description: 'Nasi hangat dengan ayam geprek pedas.', rating: 4.8, category: 'Makanan Utama' },
    { id: '992', name: 'Burger Beef Double Cheese', price: 35000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', description: 'Burger lezat dengan keju lumer renyah.', rating: 4.9, category: 'Makanan Utama' },
    { id: '993', name: 'Es Teh Manis Jumbo', price: 5000, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80', description: 'Teh manis dingin menyegarkan.', rating: 4.7, category: 'Minuman' },
    { id: '994', name: 'French Fries Saus Keju', price: 15000, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80', description: 'Kentang goreng renyah saus keju spesial.', rating: 4.5, category: 'Cemilan' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* ── Tabs ala Shopee ── */}
      <View style={{ backgroundColor: cardBg, flexDirection: 'row', borderBottomWidth: 1, borderColor: isDarkMode ? '#333' : '#eee' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
              <Text style={[styles.tabText, { color: activeTab === tab ? '#EE4D2D' : textSecondary }, activeTab === tab && { fontWeight: 'bold' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Banner Pengembalian */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#EE4D2D" />
          <Text style={styles.bannerText}>Pengembalian pesanan praktis dan cepat</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#999" style={{ marginLeft: 'auto' }} />
        </View>

        {/* Order Card */}
        <View style={[styles.orderCard, { backgroundColor: cardBg }]}>
          {/* Header Toko & Status */}
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.mallBadge}><Text style={styles.mallBadgeText}>Mall</Text></View>
              <Text style={[styles.storeName, { color: textPrimary }]}>Food Station</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={textSecondary} />
            </View>
            <Text style={styles.statusText}>{order.status === 'Delivered' ? 'Pesanan Selesai' : 'Menunggu kurir'}</Text>
          </View>

          {/* Estimasi Pengiriman */}
          {order.status !== 'Delivered' && (
            <View style={[styles.etaBox, { backgroundColor: isDarkMode ? '#2c2c2c' : '#f8f8f8' }]}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#26aa99" />
              <Text style={[styles.etaText, { color: textSecondary }]}>
                Estimasi tiba: <Text style={{ color: '#26aa99', fontWeight: 'bold' }}>sekitar 30 menit</Text>
              </Text>
            </View>
          )}

          {/* Items List */}
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: textPrimary }]} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemVariant}>Variasi: Original</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.itemQty, { color: textSecondary }]}>x{item.quantity}</Text>
                  <Text style={[styles.itemPrice, { color: textPrimary }]}>Rp {item.price.toLocaleString('id-ID')}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* Total */}
          <View style={[styles.totalRow, { borderTopColor: isDarkMode ? '#333' : '#eee' }]}>
            <Text style={[styles.totalLabel, { color: textSecondary }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: '#EE4D2D' }]}>Rp {order.total.toLocaleString('id-ID')}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {order.status !== 'Delivered' ? (
              <TouchableOpacity style={[styles.btnAction, { backgroundColor: isDarkMode ? '#333' : '#f5f5f5' }]} onPress={() => {
                alert('Pesanan dibatalkan');
                navigation.goBack();
              }}>
                <Text style={[styles.btnActionText, { color: textPrimary }]}>Batalkan pesanan</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#EE4D2D' }]} onPress={() => {
                navigation.navigate('Cart');
              }}>
                <Text style={[styles.btnActionText, { color: '#fff' }]}>Beli lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rekomendasi Shopee Style */}
        <View style={styles.recomSection}>
          <Text style={[styles.recomTitle, { color: textPrimary }]}>Anda mungkin juga menyukai</Text>
          <View style={styles.recomGrid}>
            {recommendations.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.recomCard, { backgroundColor: cardBg }]}
                onPress={() => navigation.navigate('MenuDetail', { item })}
              >
                <View style={styles.discountBadge}><Text style={styles.discountText}>-50%</Text></View>
                <Image source={{ uri: item.image }} style={styles.recomImage} />
                <View style={{ padding: 8 }}>
                  <Text style={[styles.recomName, { color: textPrimary }]} numberOfLines={2}>
                    <Text style={styles.tagCod}>[BISA COD]</Text> {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.recomPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                    <Text style={styles.recomPriceStrikethrough}>Rp {(item.price * 2).toLocaleString('id-ID')}</Text>
                  </View>
                  <Text style={styles.recomSold}>Terjual 10RB+</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tab: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#EE4D2D' },
  tabText: { fontSize: 13, fontWeight: '500' },
  banner: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', 
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ffe4e1'
  },
  bannerText: { color: '#EE4D2D', fontSize: 12, marginLeft: 8, fontWeight: '500' },
  orderCard: { marginTop: 8, padding: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mallBadge: { backgroundColor: '#d0011b', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: 6 },
  mallBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  storeName: { fontSize: 14, fontWeight: 'bold', marginRight: 4 },
  statusText: { fontSize: 13, color: '#EE4D2D', fontWeight: '500' },
  etaBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 6, marginBottom: 16 },
  etaText: { fontSize: 13, marginLeft: 8 },
  itemRow: { flexDirection: 'row', marginBottom: 16 },
  itemImage: { width: 75, height: 75, borderRadius: 4, backgroundColor: '#eee', borderWidth: 1, borderColor: '#fafafa' },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 14, marginBottom: 2 },
  itemVariant: { fontSize: 12, color: '#999', marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemQty: { fontSize: 13 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 13, marginRight: 8 },
  totalValue: { fontSize: 16, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  btnAction: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: '#ddd' },
  btnActionText: { fontSize: 13, fontWeight: '500' },
  recomSection: { padding: 12 },
  recomTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  recomGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recomCard: { 
    width: (width - 32) / 2, borderRadius: 6, marginBottom: 12, overflow: 'hidden', 
    position: 'relative', borderWidth: 1, borderColor: '#eee' 
  },
  discountBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#FF4D2D', paddingHorizontal: 4, paddingVertical: 2, zIndex: 1, borderBottomLeftRadius: 4 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  recomImage: { width: '100%', height: 160, backgroundColor: '#eee', resizeMode: 'cover' },
  recomName: { fontSize: 12, marginBottom: 4, lineHeight: 18 },
  tagCod: { color: '#EE4D2D', fontWeight: 'bold' },
  recomPrice: { fontSize: 15, fontWeight: 'bold', color: '#EE4D2D', marginRight: 4 },
  recomPriceStrikethrough: { fontSize: 10, color: '#999', textDecorationLine: 'line-through' },
  recomSold: { fontSize: 10, color: '#999', marginTop: 4 },
});

export default DeliveryTrackerScreen;