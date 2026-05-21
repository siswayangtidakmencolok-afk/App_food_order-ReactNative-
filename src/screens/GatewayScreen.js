import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useApp } from '../context/AppContext';
import { createMidtransTransaction } from '../services/midtransService';

const { width } = Dimensions.get('window');

const GatewayScreen = ({ route, navigation }) => {
  const { total, orderData } = route.params;
  const { orderHistory, session, isDarkMode } = useApp();

  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [step, setStep] = useState(1);
  const [awaitingWebhook, setAwaitingWebhook] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const midtransBlue = '#2D3192';
  const midtransLightBlue = '#2DAAE1';

  const liveOrder = orderHistory.find((o) => o.id === orderData.id) || orderData;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Realtime: webhook Midtrans mengubah payment_status → paid
  useEffect(() => {
    if (paymentFinished) return;
    if (liveOrder.paymentStatus !== 'paid') return;

    setPaymentFinished(true);
    setAwaitingWebhook(false);
    setLoading(false);

    Alert.alert('Berhasil!', 'Pembayaran dikonfirmasi Midtrans. Pesanan mulai dimasak!');

    navigation.reset({
      index: 0,
      routes: [
        { name: 'Home' },
        {
          name: 'Cart',
          state: {
            routes: [{
              name: 'DeliveryTracker',
              params: { order: { ...liveOrder, status: 'Preparing', paymentStatus: 'paid' } },
            }],
          },
        },
      ],
    });
  }, [liveOrder.paymentStatus, paymentFinished]);

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const result = await createMidtransTransaction({
        orderId: orderData.id,
        orderNumber: orderData.orderNumber || String(orderData.id),
        total,
        items: orderData.items,
        customerName: orderData.customerName || 'Customer',
        customerEmail: session?.user?.email || orderData.customerEmail || 'customer@example.com',
      });

      if (result.success && result.redirect_url) {
        setCheckoutUrl(result.redirect_url);
        setStep(2);
      } else {
        Alert.alert(
          'Gagal Pembayaran',
          `${result.error || 'Server Midtrans tidak merespons'}\n\nPastikan Edge Function create-midtrans-snap sudah di-deploy.`,
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal terhubung ke sistem pembayaran Midtrans.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewStateChange = (navState) => {
    if (
      (navState.url.includes('finish') || navState.url.includes('completed')) &&
      !awaitingWebhook &&
      !paymentFinished
    ) {
      setAwaitingWebhook(true);
    }
    if (navState.url.includes('unfinish') || navState.url.includes('cancel')) {
      setStep(1);
      setAwaitingWebhook(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="close" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.dokuBranding}>
        <Text style={[styles.dokuText, { color: midtransBlue }]}>MIDTRANS</Text>
        <View style={[styles.checkoutBadge, { backgroundColor: midtransLightBlue }]}>
          <Text style={styles.checkoutBadgeText}>SNAP</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="shield-check" size={22} color={midtransLightBlue} />
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.orderSummary}>
      <View>
        <Text style={styles.summaryLabel}>Tagihan Belanja</Text>
        <Text style={styles.summaryAmount}>Rp {total.toLocaleString('id-ID')}</Text>
      </View>
      <View style={styles.orderIdBadge}>
        <Text style={styles.orderIdText}>#{String(orderData.orderNumber).slice(-8)}</Text>
      </View>
    </View>
  );

  if (step === 2 && checkoutUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            onPress={() => { setStep(1); setAwaitingWebhook(false); }}
            style={styles.backBtnWebView}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            <Text style={styles.backText}>Batalkan</Text>
          </TouchableOpacity>
          <Text style={styles.secureText}>Secure Payment Hub</Text>
        </View>

        {awaitingWebhook && (
          <View style={styles.waitingBanner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.waitingText}>
              Menunggu konfirmasi pembayaran dari Midtrans…
            </Text>
          </View>
        )}

        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleWebViewStateChange}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color={midtransBlue} style={StyleSheet.absoluteFill} />
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
          <MaterialCommunityIcons name="credit-card-outline" size={80} color={midtransBlue} />
          <Text style={styles.mainTitle}>Siap Lanjut ke Pembayaran?</Text>
          <Text style={styles.subTitle}>
            Anda akan diarahkan ke halaman resmi Midtrans. Setelah bayar, status pesanan
            diperbarui otomatis via webhook (Realtime).
          </Text>

          <TouchableOpacity
            style={[styles.payNowBtn, { backgroundColor: midtransBlue }]}
            onPress={handlePayNow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.payNowText}>Bayar Sekarang (Midtrans)</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={styles.bottomSecurity}>
        <MaterialCommunityIcons name="lock-outline" size={14} color="#999" />
        <Text style={styles.securityText}>Keamanan Terjamin oleh Midtrans PCI-DSS</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  dokuBranding: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dokuText: { fontWeight: '900', fontSize: 20 },
  checkoutBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  checkoutBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  orderSummary: {
    backgroundColor: '#252525', padding: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
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
    marginTop: 30, paddingVertical: 16, paddingHorizontal: 24,
    borderRadius: 12, elevation: 4,
  },
  payNowText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  bottomSecurity: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, paddingVertical: 15, backgroundColor: '#f9f9f9',
  },
  securityText: { fontSize: 11, color: '#999', fontWeight: '500' },
  webViewHeader: {
    height: 60, backgroundColor: '#252525', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15,
  },
  backBtnWebView: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#fff', fontWeight: 'bold' },
  secureText: { color: '#aaa', fontSize: 12 },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2D3192',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  waitingText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

export default GatewayScreen;
