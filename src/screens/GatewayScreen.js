import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Animated, ActivityIndicator,
  Alert, SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const GatewayScreen = ({ route, navigation }) => {
  const { total, orderData } = route.params;
  const { updateOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1); // 1: Select, 2: Detail/Pay

  const methods = [
    { id: 'bca', name: 'BCA Virtual Account', icon: 'bank', color: '#0060af' },
    { id: 'mandiri', name: 'Mandiri Bill Payment', icon: 'bank', color: '#ffc107' },
    { id: 'qris', name: 'QRIS / GoPay / ShopeePay', icon: 'qrcode-scan', color: '#ee2d24' }
  ];

  const handlePay = async () => {
    setLoading(true);
    
    // Simulasi verifikasi bank (1.5 detik)
    setTimeout(async () => {
      // Update status di DB menjadi 'Preparing' (Lagi dimasak)
      await updateOrder(orderData.id, { status: 'Preparing' });
      
      setLoading(false);
      setShowSuccess(true);

      // Tampilkan animasi success sebentar, lalu lanjut ke pelacakan
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            { name: 'Home' },
            { name: 'Cart', state: { routes: [{ name: 'DeliveryTracker', params: { order: { ...orderData, status: 'Preparing' } } }] } }
          ],
        });
      }, 1500);
    }, 1500);
  };

  const renderQRIS = () => (
    <View style={styles.qrisContainer}>
      <Text style={styles.qrisTitle}>Scan QR Code untuk Membayar</Text>
      <Image 
        source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=FoodsStreets-Payment' }} 
        style={styles.qrImage} 
      />
      <Text style={styles.qrisFooter}>Bisa menggunakan GoPay, OVO, DANA, atau LinkAja</Text>
    </View>
  );

  const renderVA = (method) => (
    <View style={styles.vaContainer}>
      <Text style={styles.vaLabel}>Nomor Virtual Account {method.name}</Text>
      <View style={styles.vaBox}>
        <Text style={styles.vaNumber}>8801 {Math.floor(1000 + Math.random() * 9000)} {Math.floor(1000 + Math.random() * 9000)}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Copied', 'VA Number copied to clipboard')}>
          <MaterialCommunityIcons name="content-copy" size={20} color="#007aff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.vaInstruction}>Transfer tepat: Rp {total.toLocaleString('id-ID')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#fff" />
          <Text style={styles.headerTitle}>FoodsStreets Secure Gateway</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Order Summary Summary */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.totalLabel}>Total Bayar</Text>
            <Text style={styles.totalAmount}>Rp {total.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.orderBadge}>
            <Text style={styles.orderIdText}>ID: {orderData.orderNumber}</Text>
          </View>
        </View>

        {step === 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
            {methods.map(m => (
              <TouchableOpacity 
                key={m.id} 
                style={styles.methodCard}
                onPress={() => {
                  setSelectedMethod(m);
                  setStep(2);
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: m.color + '15' }]}>
                  <MaterialCommunityIcons name={m.icon} size={24} color={m.color} />
                </View>
                <Text style={styles.methodName}>{m.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}>
              <MaterialCommunityIcons name="arrow-left" size={16} color="#007aff" />
              <Text style={styles.backLinkText}>Ganti Metode Pembayaran</Text>
            </TouchableOpacity>

            {selectedMethod.id === 'qris' ? renderQRIS() : renderVA(selectedMethod)}

            <TouchableOpacity style={styles.payButton} onPress={handlePay}>
              <Text style={styles.payButtonText}>Simulasikan Bayar Sekarang</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <MaterialCommunityIcons name="lock" size={12} color="#999" />
          <Text style={styles.footerText}>Secure 256-bit SSL Encrypted Connection</Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007aff" />
            <Text style={styles.loadingText}>Memverifikasi Transaksi...</Text>
          </View>
        </View>
      )}

      {showSuccess && (
        <View style={styles.overlay}>
          <Animated.View style={styles.successBox}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
            <Text style={styles.successSub}>Menghubungkan Anda ke Driver...</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7f9' },
  header: { 
    backgroundColor: '#004c99', padding: 16, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center' 
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  container: { flex: 1, padding: 16 },
  summaryCard: { 
    backgroundColor: '#fff', borderRadius: 12, padding: 20, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  totalLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#333' },
  orderBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  orderIdText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12, marginLeft: 4 },
  methodCard: { 
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', 
    padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' 
  },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  methodName: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20 },
  backLinkText: { color: '#007aff', fontSize: 14, fontWeight: 'bold' },
  vaContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#007aff' },
  vaLabel: { fontSize: 12, color: '#666', marginBottom: 10 },
  vaBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vaNumber: { fontSize: 22, fontWeight: 'bold', color: '#007aff', letterSpacing: 1 },
  vaInstruction: { marginTop: 15, fontSize: 14, fontWeight: 'bold', color: '#333' },
  qrisContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  qrisTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  qrImage: { width: 220, height: 220 },
  qrisFooter: { marginTop: 15, fontSize: 11, color: '#999', textAlign: 'center' },
  payButton: { backgroundColor: '#007aff', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 10, color: '#aaa' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingBox: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: 'bold', color: '#333' },
  successBox: { backgroundColor: '#fff', padding: 40, borderRadius: 25, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 15 },
  successSub: { fontSize: 13, color: '#666', marginTop: 5 }
});

export default GatewayScreen;
