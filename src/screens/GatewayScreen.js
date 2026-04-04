import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Animated, ActivityIndicator,
  Alert, SafeAreaView, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import { createDokuTransaction } from '../services/dokuService';

const { width, height } = Dimensions.get('window');

const GatewayScreen = ({ route, navigation }) => {
  const { total, orderData } = route.params;
  const { updateOrder, isDarkMode } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [step, setStep] = useState(1); // 1: Splash/Snap, 2: Paying (WebView)
  const [paymentFinished, setPaymentFinished] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Doku Colors
  const dokuRed = '#ec2028'; 
  const dokuDark = '#252525';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePayNow = async () => {
    setLoading(true);
    try {
      // 1. Panggil Service Doku untuk mendapatkan URL Checkout
      const result = await createDokuTransaction({
        orderNumber: orderData.id, // Gunakan order ID yang unik
        total: total,
        items: orderData.items,
        customerName: orderData.customerName || 'Customer',
        customerEmail: orderData.customerEmail || 'customer@example.com'
      });

      if (result.success && result.checkout_url) {
        setCheckoutUrl(result.checkout_url);
        setStep(2); // Menuju WebView
      } else {
        Alert.alert('Gagal Pembayaran', result.error || 'Server Doku tidak merespons');
      }
    } catch (err) {
      Alert.alert('Error', 'Sistem sedang sibuk. Hubungi admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewStateChange = (navState) => {
    // Deteksi jika URL mengandung 'payment-finish' (callback kita)
    if (navState.url.includes('payment-finish') && !paymentFinished) {
      setPaymentFinished(true);
      handlePaymentSuccess();
    }
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      // Update status di Supabase ke 'Preparing' (Lunas)
      await updateOrder(orderData.id, { status: 'Preparing' });
      
      setLoading(false);
      Alert.alert('Berhasil!', 'Pembayaran telah dikonfirmasi. Pesanan mulai dimasak!');
      
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
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="close" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.dokuBranding}>
        <Text style={styles.dokuText}>DOKU</Text>
        <View style={styles.checkoutBadge}><Text style={styles.checkoutBadgeText}>CHECKOUT</Text></View>
      </View>
      <MaterialCommunityIcons name="shield-check" size={22} color={dokuRed} />
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.orderSummary}>
      <View>
        <Text style={styles.summaryLabel}>Tagihan Belanja</Text>
        <Text style={styles.summaryAmount}>Rp {total.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.orderIdBadge}>
        <Text style={styles.orderIdText}>#{orderData.orderNumber.slice(-8)}</Text>
      </View>
    </View>
  );

  if (step === 2 && checkoutUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.webViewHeader}>
           <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtnWebView}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              <Text style={styles.backText}>Batalkan</Text>
           </TouchableOpacity>
           <Text style={styles.secureText}>Secure Payment Hub</Text>
        </View>
        <WebView 
          source={{ uri: checkoutUrl }} 
          onNavigationStateChange={handleWebViewStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator size="large" color={dokuRed} style={StyleSheet.absoluteFill} />
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}
      {renderOrderSummary()}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.centerContent}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', padding: 30 }}>
           <MaterialCommunityIcons name="credit-card-outline" size={80} color={dokuRed} />
           <Text style={styles.mainTitle}>Siap Lanjut ke Pembayaran?</Text>
           <Text style={styles.subTitle}>
             Anda akan diarahkan ke halaman resmi DOKU untuk memilih metode pembayaran 
             (Transfer Bank, OVO, ShopeePay, atau QRIS).
           </Text>

           <TouchableOpacity style={styles.payNowBtn} onPress={handlePayNow} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.payNowText}>Bayar Sekarang (DOKU)</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                </View>
              )}
           </TouchableOpacity>

           <View style={styles.paymentIcons}>
              <MaterialCommunityIcons name="bank" size={24} color="#aaa" />
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#aaa" />
              <MaterialCommunityIcons name="wallet" size={24} color="#aaa" />
           </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomSecurity}>
        <MaterialCommunityIcons name="lock-outline" size={14} color="#999" />
        <Text style={styles.securityText}>Keamanan Terjamin oleh DOKU PCI-DSS</Text>
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
  dokuBranding: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dokuText: { color: '#ec2028', fontWeight: '900', fontSize: 20 },
  checkoutBadge: { backgroundColor: '#252525', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  checkoutBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  orderSummary: { 
    backgroundColor: '#252525', padding: 20, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center' 
  },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  summaryAmount: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  orderIdBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: 6 },
  orderIdText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  scroll: { flex: 1 },
  centerContent: { flexGrow: 1, justifyContent: 'center' },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#252525', marginTop: 20, textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 20 },
  payNowBtn: { 
    backgroundColor: '#ec2028', marginTop: 30, paddingVertical: 16, paddingHorizontal: 24,
    borderRadius: 12, elevation: 4, shadowColor: '#ec2028', shadowOpacity: 0.3, shadowRadius: 10
  },
  payNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  paymentIcons: { flexDirection: 'row', gap: 20, marginTop: 40, opacity: 0.5 },
  bottomSecurity: { 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 15, backgroundColor: '#f9f9f9' 
  },
  securityText: { fontSize: 11, color: '#999', fontWeight: '500' },
  webViewHeader: { 
    height: 60, backgroundColor: '#252525', flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 
  },
  backBtnWebView: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },
  secureText: { color: '#aaa', fontSize: 12 }
});

export default GatewayScreen;
