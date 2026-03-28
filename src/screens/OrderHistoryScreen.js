// src/screens/OrderHistoryScreen.js - ADVANCED VERSION
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const OrderHistoryScreen = ({ navigation }) => {
  const { orderHistory, setOrderHistory, reorder, isDarkMode, clearHistory } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
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
      'Pending': { bg: '#FFF3CD', text: '#856404' },
      'Processing': { bg: '#CCE5FF', text: '#004085' },
      'Delivering': { bg: '#D1ECF1', text: '#0C5460' },
      'Delivered': { bg: '#D4EDDA', text: '#155724' },
    };
    return colors[status] || colors['Pending'];
  };

  const getStatusIcon = (status) => {
    return {
      'Pending': '⏳',
      'Processing': '👨‍🍳',
      'Delivering': '🚚',
      'Delivered': '✅',
    }[status] || '📦';
  };

  const getProgressPercentage = (status) => {
    return {
      'Pending': '25%',
      'Processing': '50%',
      'Delivering': '75%',
      'Delivered': '100%',
    }[status] || '0%';
  };

  const handleReorder = (order) => {
    Alert.alert(
      'Pesan Ulang',
      `Tambahkan ${order.items.length} item ke keranjang?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: () => {
            reorder(order);
            navigation.navigate('Cart');
          }
        }
      ]
    );
  };

  const OrderCard = ({ order }) => {
    const statusStyle = getStatusColor(order.status);
    
    return (
      <TouchableOpacity 
        style={[styles.orderCard, { backgroundColor: theme.card }]}
        onPress={() => {
          setSelectedOrder(order);
          setModalVisible(true);
        }}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderNumber, { color: theme.text }]}>
              #{order.orderNumber}
            </Text>
            <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusIcon(order.status)} {order.status}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: getProgressPercentage(order.status),
                  backgroundColor: statusStyle.text
                }
              ]} 
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Items Preview */}
<View style={styles.itemsPreview}>
  <Text style={[styles.itemsCount, { color: theme.textSecondary }]}>
    {(order.items || []).length} item pesanan
  </Text>
  <Text style={[styles.firstItem, { color: theme.text }]} numberOfLines={1}>
    {order.items && order.items.length > 0
      ? `${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} lainnya` : ''}`
      : 'Detail pesanan'}
  </Text>
</View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
  {/* Tombol Track — selalu muncul */}
  <TouchableOpacity
    style={[styles.reorderButton, { backgroundColor: '#2196F3' }]}
    onPress={() => navigation.navigate('DeliveryTracker', { order })}
  >
    <Text style={styles.reorderButtonText}>🛵 Track</Text>
  </TouchableOpacity>

  {/* Tombol Pesan Lagi — hanya saat Delivered */}
  {order.status === 'Delivered' && (
    <TouchableOpacity
      style={[styles.reorderButton, { backgroundColor: theme.success }]}
      onPress={() => handleReorder(order)}
    >
      <Text style={styles.reorderButtonText}>🔄 Pesan Lagi</Text>
    </TouchableOpacity>
  )}
</View>
      </TouchableOpacity>
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

  const filteredData = orderHistory.filter(order => {
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
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, color: theme.textSecondary }}>📭</Text>
            <Text style={{ color: theme.text, marginTop: 10 }}>Tidak ada pesanan di kategori ini.</Text>
          </View>
        }
      />
      <OrderDetailModal />
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
  listContainer: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  itemsPreview: {
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 13,
    marginBottom: 4,
  },
  firstItem: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  reorderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 13,
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
    borderRadius: 12,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  timeline: {
    marginBottom: 8,
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
    marginTop: 4,
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
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  modalReorderButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalReorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderHistoryScreen;