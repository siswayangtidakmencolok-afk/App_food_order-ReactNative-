import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';
import PillNav from '../components/PillNav';
import ScrollHelper, { useScrollHelper } from '../components/ScrollHelper';

const { width } = Dimensions.get('window');

const OrderHistoryScreen = ({ navigation }) => {
  const { orderHistory, setOrderHistory, reorder, isDarkMode, clearHistory } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { scrollRef, isAtBottom, scrollProps } = useScrollHelper();
  const [activeTab, setActiveTab] = useState('Sedang Berjalan');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Simulasi update status otomatis setiap 10 detik
 // HAPUS INI (yang di luar):
// const STATUS_FLOW = {
//   'Pending': 'Processing',
//   'Processing': 'Delivering',
//   'Delivering': 'Delivered',
//   'Delivered': 'Delivered'
// };

// GANTI DENGAN INI:
useEffect(() => {
  const STATUS_FLOW = {
    'Pending': 'Processing',
    'Processing': 'Delivering',
    'Delivering': 'Delivered',
    'Delivered': 'Delivered'
  };

  const updateOrderStatus = () => {
    setOrderHistory(prevHistory => 
      prevHistory.map(order => {
        if (order.status !== 'Delivered') {
          return { ...order, status: STATUS_FLOW[order.status] };
        }
        return order;
      })
    );
  };

  const interval = setInterval(() => {
    updateOrderStatus();
  }, 10000);

  return () => clearInterval(interval);
}, [setOrderHistory]); // ✅ Hanya setOrderHistory sebagai dependency

  const getStatusColor = (status) => {
    const colors = {
      'Pending': { bg: ['#FFF3CD', '#FFEEBA'], text: '#856404', grad: ['#FEDCC8', '#FDB398'] },
      'Processing': { bg: ['#CCE5FF', '#B8DAFF'], text: '#004085', grad: ['#A1C4FD', '#C2E9FB'] },
      'Delivering': { bg: ['#D1ECF1', '#BEE5EB'], text: '#0C5460', grad: ['#FF9A9E', '#FAD0C4'] },
      'Delivered': { bg: ['#D4EDDA', '#C3E6CB'], text: '#155724', grad: ['#84FAB0', '#8FD3F4'] },
    };
    return colors[status] || colors['Pending'];
  };

  const getStatusIcon = (status) => {
    return {
      'Pending': 'timer-sand',
      'Processing': 'muffin',
      'Delivering': 'truck-delivery',
      'Delivered': 'check-decagram',
    }[status] || 'package-variant';
  };

  const getStatusLabel = (status) => {
    return {
      'Pending': 'Menunggu',
      'Processing': 'Dimasak',
      'Delivering': 'Dikirim',
      'Delivered': 'Selesai',
    }[status] || status;
  };

  const handleReorder = (order) => {
    Alert.alert(
      'Pesan Ulang',
      `Tambahkan ke keranjang?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            reorder(order);
            navigation.navigate('CartMain');
          }
        }
      ]
    );
  };

  const OrderCard = ({ order, index }) => {
    const statusStyle = getStatusColor(order.status);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, [index]);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }}>
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: theme.card }]}
        onPress={() => {
          setSelectedOrder(order);
          setModalVisible(true);
        }}
      >
        <LinearGradient
          colors={statusStyle.grad}
          start={{x:0, y:0}}
          end={{x:1, y:0}}
          style={styles.cardHeaderGrad}
        >
          <View style={styles.cardHeaderTop}>
            <View style={styles.orderIdBox}>
              <Text style={styles.orderIdTxt}>#{order.orderNumber.slice(-6)}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialCommunityIcons name={getStatusIcon(order.status)} size={14} color="#fff" />
              <Text style={styles.statusTagTxt}>{getStatusLabel(order.status)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={styles.itemsSection}>
            <View style={styles.thumbnails}>
              {order.items?.slice(0, 3).map((item, i) => (
                 <Image key={i} source={{ uri: item.image }} style={[styles.miniThumb, { left: i * 15, zIndex: 3 - i }]} />
              ))}
              {order.items?.length > 3 && (
                <View style={[styles.moreThumb, { left: 45 }]}>
                    <Text style={styles.moreThumbTxt}>+{order.items.length - 3}</Text>
                </View>
              )}
            </View>
            <View style={styles.orderInfoSide}>
                <Text style={[styles.mainItemName, { color: theme.text }]} numberOfLines={1}>
                  {order.items?.[0]?.name || 'Pesanan'}
                </Text>
                <Text style={[styles.orderDateTxt, { color: theme.textSecondary }]}>
                  {new Date(order.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short' })} • {order.paymentMethod}
                </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={[styles.totalLabelTxt, { color: theme.textSecondary }]}>Total Bayar</Text>
              <Text style={[styles.totalPriceTxt, { color: theme.primary }]}>Rp {order.total.toLocaleString('id-ID')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {order.status !== 'Delivered' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FF6347' }]}
                    onPress={() => navigation.navigate('DeliveryTracker', { order })}
                  >
                    <MaterialCommunityIcons name="map-marker-path" size={16} color="#fff" />
                    <Text style={styles.actionBtnTxt}>Lacak</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'Delivered' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.success }]}
                    onPress={() => handleReorder(order)}
                  >
                    <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
                    <Text style={styles.actionBtnTxt}>Ulang</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      </Animated.View>
    );
  };

  // Modal Detail
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Detail Pesanan
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              <TimelineItem 
                title="Menunggu Konfirmasi" 
                completed={true}
                active={selectedOrder.status === 'Pending'}
                theme={theme}
              />
              <TimelineItem 
                title="Sedang Diproses" 
                completed={['Processing', 'Delivering', 'Delivered'].includes(selectedOrder.status)}
                active={selectedOrder.status === 'Processing'}
                theme={theme}
              />
              <TimelineItem 
                title="Dalam Pengiriman" 
                completed={['Delivering', 'Delivered'].includes(selectedOrder.status)}
                active={selectedOrder.status === 'Delivering'}
                theme={theme}
              />
              <TimelineItem 
                title="Pesanan Selesai" 
                completed={selectedOrder.status === 'Delivered'}
                active={selectedOrder.status === 'Delivered'}
                isLast={true}
                theme={theme}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 16 }]} />

            {/* Items */}
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
              Daftar Pesanan
            </Text>
            {(selectedOrder.items || []).map((item, index) => (
            <View key={index} style={styles.modalItem}>
              <Text style={[styles.modalItemName, { color: theme.text }]}>
                {item.quantity}x {item.name || 'Item'}
              </Text>
              <Text style={[styles.modalItemPrice, { color: theme.textSecondary }]}>
                Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
              </Text>
            </View>
            ))}

            <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: 16 }]} />

            <View style={styles.modalTotal}>
              <Text style={[styles.modalTotalLabel, { color: theme.text }]}>
                Total:
              </Text>
              <Text style={styles.modalTotalValue}>
                Rp {selectedOrder.total.toLocaleString('id-ID')}
              </Text>
            </View>

            {selectedOrder.status === 'Delivered' && (
              <TouchableOpacity 
                style={[styles.modalReorderButton, { backgroundColor: theme.success }]}
                onPress={() => {
                  setModalVisible(false);
                  handleReorder(selectedOrder);
                }}
              >
                <Text style={styles.modalReorderButtonText}>
                  🔄 Pesan Lagi
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const TimelineItem = ({ title, completed, active, isLast, theme }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIconContainer}>
        <View style={[
          styles.timelineIcon,
          { borderColor: theme.border },
          completed && { backgroundColor: theme.success, borderColor: theme.success },
          active && !completed && { backgroundColor: theme.primary, borderColor: theme.primary }
        ]}>
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {!isLast && (
          <View style={[
            styles.timelineLine,
            { backgroundColor: theme.border },
            completed && { backgroundColor: theme.success }
          ]} />
        )}
      </View>
      <Text style={[
        styles.timelineTitle,
        { color: theme.textSecondary },
        (completed || active) && { color: theme.text, fontWeight: '600' }
      ]}>
        {title}
      </Text>
    </View>
  );

  // Dedup by id dulu sebelum filter
const uniqueOrders = orderHistory.filter(
  (order, index, self) => index === self.findIndex(o => o.id === order.id)
);

const filteredData = uniqueOrders.filter(order => {
    if (activeTab === 'Sedang Berjalan') return order.status !== 'Delivered';
    return order.status === 'Delivered';
  });

  if (orderHistory.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          Belum Ada Riwayat
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Pesanan yang dibuat akan muncul di sini
        </Text>
        <TouchableOpacity 
          style={[styles.menuButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.menuButtonText}>Mulai Pesan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── TABS ── */}
      <View style={{ flexDirection: 'row', backgroundColor: theme.card, elevation: 2 }}>
        {['Sedang Berjalan', 'Selesai'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && { borderBottomColor: theme.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabTxt, { color: activeTab === tab ? theme.primary : theme.textSecondary, fontWeight: activeTab === tab ? 'bold' : 'normal' }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        {...scrollProps}
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => <OrderCard order={item} index={index} />}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, color: theme.textSecondary }}>📭</Text>
            <Text style={{ color: theme.text, marginTop: 10 }}>Tidak ada pesanan di kategori ini.</Text>
          </View>
        }
        ListFooterComponent={<PillNav />}
      />
      <OrderDetailModal />
      <ScrollHelper scrollRef={scrollRef} isAtBottom={isAtBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabTxt: {
    fontSize: 14,
  },
  tabTxt: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeaderGrad: {
    padding: 15,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderIdTxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusTagTxt: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 15,
  },
  itemsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  thumbnails: {
    width: 80,
    height: 40,
    position: 'relative',
    marginRight: 10,
  },
  miniThumb: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    position: 'absolute',
  },
  moreThumb: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  moreThumbTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderInfoSide: {
    flex: 1,
  },
  mainItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderDateTxt: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  totalLabelTxt: {
    fontSize: 10,
  },
  totalPriceTxt: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  timeline: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineLine: {
    width: 2,
    height: 30,
  },
  timelineTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 14,
    flex: 1,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: { height: 1, backgroundColor: '#eee' },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  modalReorderButton: {
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  modalReorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  menuButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 15,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderHistoryScreen;