import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../config/theme';

const { width } = Dimensions.get('window');

const OrderHistoryScreen = ({ navigation }) => {
  const { orderHistory, reorder, isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState('Semua');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const colors = {
    primary: '#825100',
    primaryFixed: '#ffddb7',
    onPrimary: '#ffffff',
    surface: isDarkMode ? '#1e1e1e' : '#fff8f4',
    background: isDarkMode ? '#121212' : '#fcf9f8',
    onSurface: isDarkMode ? '#ffffff' : '#211a13',
    onSurfaceVariant: isDarkMode ? '#aaaaaa' : '#524536',
    outlineVariant: isDarkMode ? '#333333' : '#d6c3b0',
    secondaryFixed: '#ffddb7',
    onSecondaryFixedVariant: '#5e411c',
    secondaryContainer: '#fed3a1',
    onSecondaryContainer: '#795931',
    successBg: isDarkMode ? '#1a3b2b' : '#d1fae5',
    successText: isDarkMode ? '#34d399' : '#047857',
  };

  const tabs = ['Semua', 'Berlangsung', 'Selesai', 'Dibatalkan'];

  const uniqueOrders = orderHistory.filter(
    (order, index, self) => index === self.findIndex(o => o.id === order.id)
  );

  const filteredData = uniqueOrders.filter(order => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Berlangsung') return ['Pending', 'Preparing', 'Delivering'].includes(order.status);
    if (activeTab === 'Selesai') return order.status === 'Delivered';
    if (activeTab === 'Dibatalkan') return order.status === 'Cancelled';
    return true;
  });

  const dataWithPromo = [];
  filteredData.forEach((order, index) => {
    dataWithPromo.push({ type: 'order', data: order });
    if (index === 0) {
      dataWithPromo.push({ type: 'promo', id: 'promo-1' });
    }
  });

  const handleReorder = (order) => {
    reorder(order);
    navigation.navigate('Cart');
  };

  const getStatusDisplay = (status) => {
    if (['Pending', 'Preparing', 'Delivering'].includes(status)) {
      return { label: 'Proses', bg: colors.secondaryFixed, text: colors.onSecondaryFixedVariant };
    }
    if (status === 'Delivered') {
      return { label: 'Selesai', bg: colors.successBg, text: colors.successText };
    }
    if (status === 'Cancelled') {
      return { label: 'Batal', bg: '#fee2e2', text: '#991b1b' };
    }
    return { label: status, bg: colors.outlineVariant, text: colors.onSurfaceVariant };
  };

  const OrderCard = ({ order }) => {
    const statusDisp = getStatusDisplay(order.status);
    const dateObj = new Date(order.createdAt);
    const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tanggal tidak valid';
    const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const itemName = firstItem ? firstItem.name : 'Pesanan Custom';
    const itemImage = firstItem && firstItem.image ? firstItem.image : 'https://via.placeholder.com/80';
    const totalItems = order.items ? order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
    
    const isCompleted = order.status === 'Delivered' || order.status === 'Cancelled';

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? '#333' : 'rgba(214, 195, 176, 0.3)' }]}>
          <View style={styles.cardHeaderLeft}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.restaurantName, { color: colors.onSurface }]}>FoodsStreets Official</Text>
              <Text style={[styles.orderDateTime, { color: colors.onSurfaceVariant }]}>{dateStr} • {timeStr}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusDisp.bg }]}>
            <Text style={[styles.statusText, { color: statusDisp.text }]}>{statusDisp.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={[styles.itemImageWrap, isCompleted && { opacity: 0.7 }]}>
            <Image source={{ uri: itemImage }} style={[styles.itemImage, isCompleted ? { tintColor: isDarkMode ? undefined : 'gray' } : {}]} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.onSurface }]} numberOfLines={1}>{itemName}</Text>
            <Text style={[styles.itemCount, { color: colors.onSurfaceVariant }]}>{totalItems} Item</Text>
            
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.totalLabel, { color: colors.onSurfaceVariant }]}>Total Bayar</Text>
                <Text style={[styles.totalPrice, { color: colors.onSurface }]}>Rp {(order.total || 0).toLocaleString('id-ID')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#333' : 'rgba(214, 195, 176, 0.3)' }]}>
          {isCompleted ? (
            <TouchableOpacity 
              style={[styles.btnOutline, { borderColor: colors.primary }]}
              onPress={() => handleReorder(order)}
            >
              <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Beli Lagi</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.btnOutline, { borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }]}
              onPress={() => navigation.navigate('Cart', { screen: 'DeliveryTracker', params: { order } })}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.primary} />
              <Text style={[styles.btnOutlineText, { color: colors.primary }]}>Lacak</Text>
            </TouchableOpacity>
          )}
          <View style={{ width: 12 }} />
          <TouchableOpacity 
            style={[styles.btnSolid, { backgroundColor: colors.primary }]}
            onPress={() => {
              setSelectedOrder(order);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.btnSolidText, { color: colors.onPrimary }]}>Detail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const PromoCard = () => (
    <TouchableOpacity style={[styles.promoCard, { borderColor: colors.outlineVariant }]}>
      <Image 
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKXqaYbK5m2LpgXD1aW7QSRpdIJ5cdCqzvxNMHL5sLojuEWYNJHVK5DCNt6BHstI8LaTqy8G3HWVRYid-78TzabohDALuXe-IsoG34NNNiYHOLelNouE1BwieQKeey-WgeoKSqw1qd94IfErHgECQIBYuhsuFL5E9xmAuaydebouYEwc_X2aYSplNVwYU0hwojsrou1T8pyJWRiMyeH4neyntHO_ncJfMniWtVlVA-SkFJWnYsk8bGdIyb3nw2AYi0CAQZU7P7QIie' }}
        style={styles.promoImage}
      />
      <View style={styles.promoOverlay}>
        <View style={[styles.promoBadge, { backgroundColor: colors.secondaryContainer }]}>
          <Text style={[styles.promoBadgeText, { color: colors.onSecondaryContainer }]}>PROMO KILAT</Text>
        </View>
        <Text style={styles.promoTitle}>Dapatkan Cashback 50% Untuk Pesanan Berikutnya!</Text>
        <Text style={styles.promoSub}>S&K Berlaku</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    if (item.type === 'promo') return <PromoCard />;
    return <OrderCard order={item.data} />;
  };

  const OrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Detail Pesanan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
              <View style={[styles.modalInfoBox, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.modalInfoTitle, { color: colors.onSurfaceVariant }]}>Order ID</Text>
                <Text style={[styles.modalInfoValue, { color: colors.onSurface }]}>#{selectedOrder.orderNumber || (selectedOrder.id ? selectedOrder.id.slice(0,8) : 'ORD')}</Text>
                
                <View style={styles.divider} />
                
                <Text style={[styles.modalInfoTitle, { color: colors.onSurfaceVariant }]}>Status</Text>
                <Text style={[styles.modalInfoValue, { color: colors.primary }]}>{selectedOrder.status}</Text>
              </View>

              <Text style={[styles.modalSectionTitle, { color: colors.onSurface }]}>Daftar Pesanan</Text>
              {(selectedOrder.items || []).map((item, index) => (
                <View key={index.toString()} style={styles.modalItemRow}>
                  <Text style={[styles.modalItemName, { color: colors.onSurface }]}>
                    {item.quantity}x {item.name || 'Item'}
                  </Text>
                  <Text style={[styles.modalItemPrice, { color: colors.onSurfaceVariant }]}>
                    Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))}

              <View style={[styles.divider, { backgroundColor: colors.outlineVariant, marginVertical: 16 }]} />

              <View style={styles.modalTotalRow}>
                <Text style={[styles.modalTotalLabel, { color: colors.onSurface }]}>Total Pembayaran</Text>
                <Text style={[styles.modalTotalValue, { color: colors.primary }]}>
                  Rp {(selectedOrder.total || 0).toLocaleString('id-ID')}
                </Text>
              </View>

              {selectedOrder.status === 'Delivered' && (
                <TouchableOpacity 
                  style={[styles.modalReorderBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setModalVisible(false);
                    handleReorder(selectedOrder);
                  }}
                >
                  <Text style={[styles.modalReorderBtnText, { color: colors.onPrimary }]}>Pesan Ulang</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialCommunityIcons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>QuickBite</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <MaterialCommunityIcons name="cart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {tabs.map(tab => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity 
                  key={tab} 
                  style={[
                    styles.tabButton, 
                    isActive ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.outlineVariant }
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabButtonText, { color: isActive ? colors.onPrimary : colors.onSurfaceVariant }]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Riwayat Pesanan</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <MaterialCommunityIcons name="filter-variant" size={18} color={colors.primary} />
            <Text style={[styles.filterBtnText, { color: colors.primary }]}>Filter</Text>
          </TouchableOpacity>
        </View>

        {dataWithPromo.length > 0 ? (
          <FlatList
            data={dataWithPromo}
            keyExtractor={(item, index) => item.type === 'promo' ? 'promo-' + index : item.data.id.toString() + '-' + index}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="receipt" size={60} color={colors.outlineVariant} />
            <Text style={[styles.emptyText, { color: colors.onSurface }]}>Belum ada pesanan</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>Pesanan Anda akan muncul di sini</Text>
          </View>
        )}
      </ScrollView>

      <OrderDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  iconBtn: {
    padding: 8,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginLeft: 4,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  orderDateTime: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  btnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
  btnSolid: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '500',
  },
  promoCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    aspectRatio: 2.21,
    marginBottom: 16,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  promoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  promoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '80%',
    lineHeight: 24,
  },
  promoSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 8,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  modalInfoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalInfoTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalItemName: {
    fontSize: 14,
    flex: 1,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalReorderBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalReorderBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
