// src/screens/InvoiceScreen.js
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InvoiceScreen = ({ navigation, route }) => {
  const { order } = route.params;

  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleDone = () => {
    navigation.navigate('DeliveryTracker', { order });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Success Header with Animated Logo */}
      <View style={styles.successHeader}>
        <Animated.View style={[styles.logoContainer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.logoRow}>
            <MaterialCommunityIcons name="weather-windy" size={28} color="#FFF" style={styles.windIcon} />
            <MaterialCommunityIcons name="moped" size={70} color="#FFF" />
            <View style={styles.foodDome}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#4CAF50" />
            </View>
          </View>
          <Text style={styles.logoText}>FOOD DELIVERY</Text>
        </Animated.View>

        <Text style={styles.successTitle}>Pesanan Berhasil!</Text>
        <Text style={styles.successSubtitle}>
          Pesanan Anda telah diterima dan sedang diproses
        </Text>
      </View>

      {/* Invoice Card */}
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        </View>

        <View style={styles.divider} />

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pemesan</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama:</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telepon:</Text>
            <Text style={styles.infoValue}>{order.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat:</Text>
            <Text style={[styles.infoValue, styles.addressText]}>
              {order.deliveryAddress}
            </Text>
          </View>
          {order.orderNotes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Catatan:</Text>
              <Text style={[styles.infoValue, styles.notesText]}>
                {order.orderNotes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Pesanan</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Payment Summary */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              Rp {order.total.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Biaya Pengiriman</Text>
            <Text style={styles.summaryValue}>GRATIS</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Diskon</Text>
            <Text style={styles.summaryValue}>Rp 0</Text>
          </View>
          
          <View style={styles.totalDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>
              Rp {order.total.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodText}>
              {order.paymentMethod}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Waktu Pemesanan:</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimasi Sampai:</Text>
            <Text style={styles.infoValue}>
              ± {order.estimatedDelivery} (30 menit)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>⏳ {order.status}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>ℹ️ Informasi</Text>
        <Text style={styles.infoBoxText}>
          • Simpan screenshot invoice ini sebagai bukti pesanan{'\n'}
          • Pesanan akan diproses segera{'\n'}
          • Cek tab Riwayat untuk tracking pesanan{'\n'}
          • Hubungi kami jika ada kendala
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>Selesai</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.trackButton}
        onPress={handleDone}
      >
        <Text style={styles.trackButtonText}>Track Pesanan</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  successHeader: {
    backgroundColor: '#4CAF50',
    padding: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  windIcon: {
    marginRight: -10,
    marginTop: 15,
  },
  foodDome: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    lineHeight: 20,
  },
  notesText: {
    fontStyle: 'italic',
    color: '#FF6347',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  paymentMethodBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#FF6347',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6347',
  },
  trackButtonText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
  },
});

export default InvoiceScreen;