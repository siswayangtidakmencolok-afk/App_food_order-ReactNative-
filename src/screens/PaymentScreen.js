import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import PinInputModal from '../components/PinInputModal';
import ScrollHelper, { useScrollHelper } from '../components/ScrollHelper';
import { useApp } from '../context/AppContext';
import { processEWalletPayment } from '../services/eWallet';

const PaymentScreen = ({ navigation, route }) => {
  const { total: originalTotal } = route.params;
  const { isDarkMode, cart, saveOrder, userLocation } = useApp();
  const { scrollRef, scrollYValue, isAtBottom, scrollProps } = useScrollHelper();
  
  const bg = isDarkMode ? '#0a0a0a' : '#f5f5f5';
  const card = isDarkMode ? '#161616' : '#ffffff';
  const textCol = isDarkMode ? '#f0f0f0' : '#1a1a1a';
  const border = isDarkMode ? '#333' : '#e0e0e0';

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deliveryAddress, setDeliveryAddress]   = useState(userLocation.address);
  const [orderNotes, setOrderNotes]             = useState('');
  const [customerName, setCustomerName]         = useState('');
  const [phoneNumber, setPhoneNumber]           = useState('');
  const [isProcessing, setIsProcessing]         = useState(false);
  const [showPinModal, setShowPinModal]         = useState(false);
  const [walletType, setWalletType]             = useState(null);

  // ── Coupon Logic ──
  const [couponCode, setCouponCode]             = useState('');
  const [isCouponApplied, setIsCouponApplied]   = useState(false);
  const [discountPercent, setDiscountPercent]   = useState(0);
  const [couponMessage, setCouponMessage]       = useState('');

  const finalTotal = originalTotal - (originalTotal * discountPercent);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    
    if (code === 'PROMO40' || code === 'VIRAL40' || code === 'DISKON40') {
      setDiscountPercent(0.40);
      setIsCouponApplied(true);
      setCouponMessage('🎉 Kupon diterapkan! Kamu hemat 40%');
    } else if (code === 'GRATISONGKIR') {
      setDiscountPercent(0.15); // Diskon subsidi 15%
      setIsCouponApplied(true);
      setCouponMessage('🎉 Subsidi Ongkir (15%) diterapkan!');
    } else {
      setDiscountPercent(0);
      setIsCouponApplied(false);
      setCouponMessage('❌ Kode promo tidak valid atau kadaluarsa.');
    }
  };

  const handleCancelCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setIsCouponApplied(false);
    setCouponMessage('');
  };

  // ── Countdown state ──────────────────────────────────────
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNum, setCountdownNum]   = useState(3);
  const [pendingOrder, setPendingOrder]   = useState(null);
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const animateNumber = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(1);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    if (!showCountdown) return;
    animateNumber();

    if (countdownNum > 0) {
      const t = setTimeout(() => setCountdownNum(n => n - 1), 1000);
      return () => clearTimeout(t);
    } else {
      // Countdown selesai → navigate
      const t = setTimeout(() => {
        setShowCountdown(false);
        navigation.navigate('Invoice', { order: pendingOrder });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [showCountdown, countdownNum]);

  // ─────────────────────────────────────────────────────────

  const paymentMethods = [
    { id: 'cod',      name: 'Cash on Delivery (COD)', icon: '💵', description: 'Bayar saat pesanan sampai' },
    { id: 'gopay',    name: 'GoPay',                   icon: '🟩', description: 'Bayar pakai saldo GoPay' },
    { id: 'ovo',      name: 'OVO',                     icon: '🟪', description: 'Bayar pakai saldo OVO' },
    { id: 'dana',     name: 'DANA',                    icon: '🟦', description: 'Bayar pakai saldo DANA' },
    { id: 'transfer', name: 'Transfer Bank',           icon: '🏦', description: 'BCA, Mandiri, BNI, BRI' },
    { id: 'qris',     name: 'QRIS',                    icon: '📲', description: 'Scan QR untuk bayar' },
  ];

  const handlePayment = async () => {
    if (!customerName.trim())    { Alert.alert('Error', 'Nama harus diisi!'); return; }
    if (!phoneNumber.trim())     { Alert.alert('Error', 'Nomor telepon harus diisi!'); return; }
    if (!deliveryAddress.trim()) { Alert.alert('Error', 'Alamat pengiriman harus diisi!'); return; }
    if (!selectedPayment)        { Alert.alert('Error', 'Pilih metode pembayaran!'); return; }

    const orderNum = `ORD${Date.now().toString().slice(-8)}`;

    const isEWallet = ['gopay', 'ovo', 'dana'].includes(selectedPayment);

    if (isEWallet) {
      setWalletType(selectedPayment);
      setShowPinModal(true);
      // Logic lanjut di handlePinComplete
      return;
    }

    processFinalOrder(orderNum);
  };

  const handlePinComplete = async (pin) => {
    setShowPinModal(false);
    setIsProcessing(true);
    const orderNum = `ORD${Date.now().toString().slice(-8)}`;

    try {
      await processEWalletPayment(walletType, finalTotal, orderNum, pin);
      processFinalOrder(orderNum);
    } catch (err) {
      Alert.alert('Pembayaran Gagal', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processFinalOrder = async (orderNum) => {
    const newOrder = {
      id: Date.now(),
      orderNumber: orderNum,
      items: [...cart],
      total: finalTotal,
      originalTotal: originalTotal,
      discount: originalTotal * discountPercent,
      customerName,
      phoneNumber,
      deliveryAddress,
      orderNotes,
      paymentMethod: paymentMethods.find(p => p.id === selectedPayment)?.name,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit',
      }),
    };

    const { data: savedOrder, error } = await saveOrder(newOrder);
    if (error) {
      Alert.alert('Error', 'Gagal menyimpan pesanan. Coba lagi.');
      return;
    }
    
    const isGatewayMethod = ['transfer', 'qris'].includes(selectedPayment);

    if (isGatewayMethod) {
      navigation.navigate('Gateway', { total: finalTotal, orderData: savedOrder });
    } else {
      navigation.navigate('Invoice', { order: savedOrder });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        {...scrollProps}
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informasi Pemesan</Text>
          <Text style={styles.label}>Nama Lengkap *</Text>
          <TextInput style={styles.input} placeholder="Masukkan nama lengkap" value={customerName} onChangeText={setCustomerName} />
          <Text style={styles.label}>Nomor Telepon *</Text>
          <TextInput style={styles.input} placeholder="08xxxxxxxxxx" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Alamat Pengiriman *</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota" value={deliveryAddress} onChangeText={setDeliveryAddress} multiline numberOfLines={3} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Catatan Pesanan (Opsional)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Contoh: Jangan pakai cabai, dll" value={orderNotes} onChangeText={setOrderNotes} multiline numberOfLines={2} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎟️ Kode Kupon / Promo</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput 
              style={[styles.input, { flex: 1, textTransform: 'uppercase' }]} 
              placeholder="Masukkan kode (mis. PROMO40)" 
              value={couponCode} 
              onChangeText={setCouponCode} 
              editable={!isCouponApplied} 
            />
            {!isCouponApplied ? (
              <TouchableOpacity style={styles.applyCouponBtn} onPress={handleApplyCoupon}>
                <Text style={styles.applyCouponTxt}>Pakai</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.applyCouponBtn, { backgroundColor: '#e74c3c' }]} onPress={handleCancelCoupon}>
                <Text style={styles.applyCouponTxt}>Batal</Text>
              </TouchableOpacity>
            )}
          </View>
          {couponMessage ? (
              <Text style={{ color: isCouponApplied ? '#2ecc71' : '#e74c3c', marginTop: 8, fontSize: 13, fontWeight: 'bold' }}>{couponMessage}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Pilih Metode Pembayaran *</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity key={method.id} style={[styles.paymentCard, selectedPayment === method.id && styles.paymentCardSelected]} onPress={() => setSelectedPayment(method.id)}>
              <View style={styles.paymentLeft}>
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <View>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDesc}>{method.description}</Text>
                </View>
              </View>
              <View style={[styles.radioButton, selectedPayment === method.id && styles.radioButtonSelected]}>
                {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Jumlah Item:</Text><Text style={styles.summaryValue}>{cart.length} item</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Pesanan:</Text><Text style={styles.summaryValue}>Rp {originalTotal.toLocaleString('id-ID')}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Biaya Pengiriman:</Text><Text style={styles.summaryValue}>GRATIS</Text></View>
          {isCouponApplied && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {color: '#2ecc71', fontWeight: 'bold'}]}>Diskon Kupon:</Text>
              <Text style={[styles.summaryValue, {color: '#2ecc71', fontWeight: 'bold'}]}>- Rp {(originalTotal * discountPercent).toLocaleString('id-ID')}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total Bayar:</Text><Text style={styles.totalValue}>Rp {finalTotal.toLocaleString('id-ID')}</Text></View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessing}>
          <Text style={styles.payButtonText}>{isProcessing ? 'Memproses E-Wallet...' : 'Konfirmasi & Bayar'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      <ScrollHelper scrollRef={scrollRef} scrollYValue={scrollYValue} isAtBottom={isAtBottom} />

      {/* ── PIN Entry Modal ── */}
      <PinInputModal
        visible={showPinModal}
        walletType={walletType}
        onComplete={handlePinComplete}
        onCancel={() => setShowPinModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:            { flex: 1 },
  section:              { padding: 16, marginTop: 12 },
  sectionTitle:         { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  label:                { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input:                { borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1 },
  textArea:             { height: 80, textAlignVertical: 'top' },
  paymentCard:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  paymentCardSelected:  { borderColor: '#FF6347' },
  paymentLeft:          { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentIcon:          { fontSize: 32, marginRight: 12 },
  paymentName:          { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  paymentDesc:          { fontSize: 12 },
  radioButton:          { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioButtonSelected:  { borderColor: '#FF6347' },
  radioButtonInner:     { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6347' },
  summarySection:       { padding: 16, marginTop: 12 },
  summaryTitle:         { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  summaryRow:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel:         { fontSize: 14, color: '#666' },
  summaryValue:         { fontSize: 14, color: '#333', fontWeight: '500' },
  divider:              { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  totalLabel:           { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue:           { fontSize: 18, fontWeight: 'bold', color: '#FF6347' },
  payButton:            { backgroundColor: '#FF6347', padding: 18, margin: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  payButtonText:        { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomSpace:          { height: 20 },
  // Countdown
  countdownOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  countdownCard:        { backgroundColor: '#fff', borderRadius: 24, padding: 40, alignItems: 'center', width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  countdownLabel:       { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 20 },
  countdownNumber:      { fontSize: 100, fontWeight: 'bold', lineHeight: 110 },
  countdownDots:        { flexDirection: 'row', marginTop: 20, gap: 8 },
  countdownDot:         { width: 12, height: 12, borderRadius: 6 },
  countdownSub:         { fontSize: 13, color: '#999', marginTop: 16 },
  // Kupon
  applyCouponBtn:       { backgroundColor: '#2ecc71', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  applyCouponTxt:       { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

export default PaymentScreen;