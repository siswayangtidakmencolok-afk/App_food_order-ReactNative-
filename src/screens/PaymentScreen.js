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
import { useApp } from '../context/AppContext';
import { processEWalletPayment } from '../services/eWallet';
import PinInputModal from '../components/PinInputModal';

const PaymentScreen = ({ navigation, route }) => {
  const { total } = route.params;
  const { cart, saveOrder } = useApp();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deliveryAddress, setDeliveryAddress]   = useState('');
  const [orderNotes, setOrderNotes]             = useState('');
  const [customerName, setCustomerName]         = useState('');
  const [phoneNumber, setPhoneNumber]           = useState('');
  const [isProcessing, setIsProcessing]         = useState(false);
  const [showPinModal, setShowPinModal]         = useState(false);
  const [walletType, setWalletType]             = useState(null);

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
      await processEWalletPayment(walletType, total, orderNum, pin);
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
      total,
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
    setPendingOrder(savedOrder);

    // Mulai countdown
    setCountdownNum(3);
    setShowCountdown(true);
  };

  const countdownDisplay = countdownNum === 0 ? '🚀' : countdownNum.toString();
  const countdownLabel   = countdownNum === 0 ? 'Pesanan Dikirim!' : 'Pesanan dikonfirmasi...';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
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
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Pesanan:</Text><Text style={styles.summaryValue}>Rp {total.toLocaleString('id-ID')}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Biaya Pengiriman:</Text><Text style={styles.summaryValue}>GRATIS</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total Bayar:</Text><Text style={styles.totalValue}>Rp {total.toLocaleString('id-ID')}</Text></View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isProcessing}>
          <Text style={styles.payButtonText}>{isProcessing ? 'Memproses E-Wallet...' : 'Konfirmasi & Bayar'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ── Countdown Overlay ── */}
      {showCountdown && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>{countdownLabel}</Text>
            <Animated.Text style={[
              styles.countdownNumber,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
                color: countdownNum === 0 ? '#4CAF50' : '#FF6347',
              }
            ]}>
              {countdownDisplay}
            </Animated.Text>
            <View style={styles.countdownDots}>
              {[3, 2, 1].map(n => (
                <View key={n} style={[
                  styles.countdownDot,
                  { backgroundColor: n >= countdownNum && countdownNum > 0 ? '#FF6347' : '#eee' }
                ]} />
              ))}
            </View>
            <Text style={styles.countdownSub}>
              {countdownNum > 0 ? `Memproses pesanan...` : 'Mengarahkan ke invoice...'}
            </Text>
          </View>
        </View>
      )}

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
  container:            { flex: 1, backgroundColor: '#f5f5f5' },
  section:              { backgroundColor: '#fff', padding: 16, marginTop: 12 },
  sectionTitle:         { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  label:                { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 8 },
  input:                { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea:             { height: 80, textAlignVertical: 'top' },
  paymentCard:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  paymentCardSelected:  { borderColor: '#FF6347', backgroundColor: '#fff5f4' },
  paymentLeft:          { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentIcon:          { fontSize: 32, marginRight: 12 },
  paymentName:          { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  paymentDesc:          { fontSize: 12, color: '#666' },
  radioButton:          { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioButtonSelected:  { borderColor: '#FF6347' },
  radioButtonInner:     { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6347' },
  summarySection:       { backgroundColor: '#fff', padding: 16, marginTop: 12 },
  summaryTitle:         { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
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
});

export default PaymentScreen;