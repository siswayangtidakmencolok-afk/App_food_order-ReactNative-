import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Animated, ActivityIndicator,
  Alert, SafeAreaView, Dimensions, Clipboard
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { createSnapTransaction, BANK_ICONS } from '../services/midtransService';


const { width } = Dimensions.get('window');

const GatewayScreen = ({ route, navigation }) => {
  const { total, orderData } = route.params;
  const { updateOrder, isDarkMode } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1); // 1: Splash/Snap, 2: Select Method, 3: Instructions, 4: Paying
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Midtrans Colors
  const midtransBase = '#00afaa'; // Tosca resmi Midtrans
  const midtransDark = '#1d2c4d';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep(3);
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    
    // Alur Simulasi Sandbox
    setTimeout(async () => {
      try {
        // 1. Update Supabase ke 'Preparing'
        await updateOrder(orderData.id, { status: 'Preparing' });
        
        setLoading(false);
        setShowSuccess(true);

        // 2. Transisi ke Tracker
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Home' },
              { 
                name: 'Cart', 
                state: { 
                  routes: [{ 
                    name: 'DeliveryTracker', 
                    params: { order: { ...orderData, status: 'Preparing' } } 
                  }] 
                } 
              }
            ],
          });
        }, 2000);
      } catch (err) {
        setLoading(false);
        Alert.alert('Error', 'Gagal memverifikasi pembayaran simulasi.');
      }
    }, 1500);
  };

  const methods = [
    { id: 'bca', name: 'BCA Virtual Account', alias: 'BCA', type: 'va' },
    { id: 'mandiri', name: 'Mandiri Bill Payment', alias: 'Mandiri', type: 'va' },
    { id: 'bni', name: 'BNI Virtual Account', alias: 'BNI', type: 'va' },
    { id: 'bri', name: 'BRI Virtual Account', alias: 'BRI', type: 'va' },
    { id: 'qris', name: 'QRIS (Gopay, ShopeePay, etc)', alias: 'QRIS', type: 'qris' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.midtransBranding}>
        <Image 
          source={{ uri: 'https://midtrans.com/img/logos/midtrans-simple.png' }} 
          style={styles.midtransLogo} 
          resizeMode="contain"
        />
        <Text style={styles.sandboxBadge}>SANDBOX</Text>
      </View>
      <MaterialCommunityIcons name="shield-check" size={22} color={midtransBase} />
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.orderSummary}>
      <View>
        <Text style={styles.summaryLabel}>Total Pembayaran</Text>
        <Text style={styles.summaryAmount}>Rp {total.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.orderIdBadge}>
        <Text style={styles.orderIdText}>#{orderData.orderNumber.slice(-8)}</Text>
      </View>
    </View>
  );

  const renderStepSelect = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
      {methods.map((m) => (
        <TouchableOpacity 
          key={m.id} 
          style={styles.methodItem}
          onPress={() => handleMethodSelect(m)}
        >
          <Image source={{ uri: BANK_ICONS[m.id] }} style={styles.bankIconLarge} resizeMode="contain" />
          <Text style={styles.methodNameText}>{m.name}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </Animated.View>
  );

  const renderStepInstruction = () => (
    <View style={styles.stepContainer}>
      <View style={styles.instructionCard}>
        {selectedMethod.type === 'va' ? (
          <>
            <Image source={{ uri: BANK_ICONS[selectedMethod.id] }} style={styles.bankIconLarge} resizeMode="contain" />
            <Text style={styles.instructionTitle}>Selesaikan Pembayaran</Text>
            <Text style={styles.vaLabel}>Nomor Virtual Account {selectedMethod.alias}</Text>
            <View style={styles.vaBox}>
              <Text style={styles.vaNumber}>8801 023 {Math.floor(1000 + Math.random() * 9000)}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Copied', 'VA Number copied!')}>
                <MaterialCommunityIcons name="content-copy" size={18} color={midtransBase} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <Text style={styles.guideText}>Cara Pembayaran:</Text>
            <Text style={styles.guideStep}>1. Buka aplikasi M-Banking {selectedMethod.alias}.</Text>
            <Text style={styles.guideStep}>2. Pilih menu Transfer / Virtual Account.</Text>
            <Text style={styles.guideStep}>3. Masukkan nomor VA di atas.</Text>
            <Text style={styles.guideStep}>4. Periksa jumlah tagihan dan bayar.</Text>
          </>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Image  source={{ uri: BANK_ICONS.qris }} style={{ width: 120, height: 40 }} resizeMode="contain" />
            <Text style={styles.instructionTitle}>Scan QR Code</Text>
            <View style={styles.qrWrapper}>
              <Image 
                source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MIDTRANS-SANDBOX-FoodsStreets' }} 
                style={styles.qrCode}
              />
            </View>
            <Text style={styles.qrisFooter}>Dukung: GoPay, OVO, LinkAja, BCA, dll.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.mainActionBtn} onPress={handleSimulatePayment}>
        <Text style={styles.mainActionBtnText}>Simulasikan Pembayaran Berhasil</Text>
      </TouchableOpacity>
      
      <Text style={styles.disclaimerText}>
        Anda sedang berada di lingkungan Sandbox (Percobaan). Tidak ada uang nyata yang ditarik.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}
      {renderOrderSummary()}

      <ScrollView style={styles.scroll}>
        {step === 1 && renderStepSelect()}
        {step === 3 && renderStepInstruction()}
      </ScrollView>

      {/* Overlays */}
      {loading && (
        <View style={styles.fullOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={midtransBase} />
            <Text style={styles.loadingTip}>Memproses Transaksi...</Text>
          </View>
        </View>
      )}

      {showSuccess && (
        <View style={styles.fullOverlay}>
          <View style={styles.successCard}>
            <MaterialCommunityIcons name="check-decagram" size={70} color="#4CAF50" />
            <Text style={styles.successHeading}>PEMBAYARAN BERHASIL</Text>
            <Text style={styles.successSub}>Kami sedang menyiapkan pesanan Anda!</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSecurity}>
        <MaterialCommunityIcons name="lock-outline" size={14} color="#999" />
        <Text style={styles.securityText}>Secure Payment by Midtrans</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  midtransBranding: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  midtransLogo: { width: 80, height: 20 },
  sandboxBadge: { 
    backgroundColor: '#ffc107', fontSize: 9, fontWeight: 'bold', 
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 
  },
  orderSummary: { 
    backgroundColor: '#1d2c4d', padding: 20, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center' 
  },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  summaryAmount: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  orderIdBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: 6 },
  orderIdText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  scroll: { flex: 1 },
  stepContainer: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1d2c4d', marginBottom: 20 },
  methodItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: '#f0f0f0'
  },
  bankIconLarge: { width: 50, height: 30, marginRight: 15 },
  methodNameText: { flex: 1, fontSize: 14, color: '#333', fontWeight: '600' },
  instructionCard: { 
    backgroundColor: '#f8f9fb', padding: 25, borderRadius: 15, alignItems: 'center',
    marginBottom: 30, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc'
  },
  instructionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1d2c4d', marginTop: 15, marginBottom: 20 },
  vaLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  vaBox: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee'
  },
  vaNumber: { fontSize: 18, fontWeight: 'bold', color: '#00afaa', letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 20 },
  guideText: { fontSize: 14, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  guideStep: { fontSize: 13, color: '#666', alignSelf: 'flex-start', marginBottom: 6 },
  qrWrapper: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 5 },
  qrCode: { width: 180, height: 180 },
  qrisFooter: { marginTop: 15, fontSize: 11, color: '#999' },
  mainActionBtn: { 
    backgroundColor: '#00afaa', padding: 16, borderRadius: 10, alignItems: 'center',
    shadowColor: '#00afaa', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  mainActionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disclaimerText: { 
    fontSize: 11, color: '#999', textAlign: 'center', marginTop: 20, 
    lineHeight: 16, paddingHorizontal: 20 
  },
  fullOverlay: { 
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', alignItems: 'center', zIndex: 9999 
  },
  loadingCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center' },
  loadingTip: { marginTop: 15, fontWeight: 'bold', color: '#333' },
  successCard: { backgroundColor: '#fff', width: '80%', padding: 40, borderRadius: 25, alignItems: 'center' },
  successHeading: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 20 },
  successSub: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 },
  bottomSecurity: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 15, backgroundColor: '#f8f9fb' 
  },
  securityText: { fontSize: 11, color: '#999', fontWeight: '500' }
});

export default GatewayScreen;
