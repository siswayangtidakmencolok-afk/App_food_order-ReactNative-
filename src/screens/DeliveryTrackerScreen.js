import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, PanResponder } from 'react-native';
import MapComponent from '../components/MapComponent';
import { GEOAPIFY_KEY } from '../config/maps';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const DeliveryTrackerScreen = ({ route, navigation }) => {
  const { order: routeOrder } = route.params;
  const { isDarkMode, userLocation, updateOrder, orderHistory } = useApp();
  const order = orderHistory.find((o) => o.id === routeOrder.id) || routeOrder;

  // ── Simulation State ──
  const RESTAURANT_LOC = { latitude: -6.2000, longitude: 106.8400 };
  const [driverLoc, setDriverLoc] = useState(RESTAURANT_LOC);
  const [simStatus, setSimStatus] = useState(order.status);
  const [isPreparing, setIsPreparing] = useState(
    order.status === 'Pending' || order.status === 'Preparing',
  );

  useEffect(() => {
    setSimStatus(order.status);
    if (order.status === 'Preparing') setIsPreparing(true);
    if (order.status === 'Delivering' || order.status === 'Delivered') setIsPreparing(false);
  }, [order.status]);

  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    fetchRoute();
  }, [userLocation]);

  const fetchRoute = async () => {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${RESTAURANT_LOC.latitude},${RESTAURANT_LOC.longitude}|${userLocation.latitude},${userLocation.longitude}&mode=drive&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates[0].map(c => ({
          latitude: c[1],
          longitude: c[0]
        }));
        setRouteCoords(coords);
        startSimulation(coords);
      }
    } catch (e) {
      console.error('Routing Error:', e);
    }
  };

  const startSimulation = (coords) => {
    setTimeout(() => {
      setIsPreparing(false);
      setSimStatus('Delivering');

      let currentIdx = 0;
      const moveInterval = setInterval(() => {
        if (currentIdx < coords.length) {
          setDriverLoc(coords[currentIdx]);
          currentIdx++;
        } else {
          clearInterval(moveInterval);
          setTimeout(finishOrder, 1000);
        }
      }, 1200);
    }, 4000);
  };

  const finishOrder = async () => {
    setSimStatus('Delivered');
    await updateOrder(order.id, { status: 'Delivered' });
    Alert.alert('🎉 Pesanan Sampai!', 'Kurir sudah sampai di lokasi tujuan Anda. Selamat menikmati!');
  };

  // ── Bottom Sheet Draggable Logic ──
  const sheetAnim = useRef(new Animated.Value(0)).current; // 0 = expanded, 1 = collapsed
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SHEET_HEIGHT = height * 0.85;
  const VISIBLE_WHEN_COLLAPSED = 140; // Height visible when minimized

  const toggleSheet = () => {
    if (isCollapsed) {
      Animated.spring(sheetAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }).start(() => {
        setIsCollapsed(false);
      });
    } else {
      Animated.spring(sheetAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start(() => {
        setIsCollapsed(true);
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 && !isCollapsed) {
          toggleSheet();
        } else if (gestureState.dy < -50 && isCollapsed) {
          toggleSheet();
        }
      }
    })
  ).current;

  // The bottom sheet covers 85% of screen. Collapsed state translates it down so only the top is visible.
  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SHEET_HEIGHT - VISIBLE_WHEN_COLLAPSED] 
  });

  const arrowRotation = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // ── UI Helpers ──
  const primaryColor = '#825100';
  const primaryFixed = '#ffddb7';
  const bgSurface = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textPrimary = isDarkMode ? '#ffffff' : '#211a13';
  const textMuted = isDarkMode ? '#aaaaaa' : '#524536';
  const borderCol = isDarkMode ? '#333333' : '#eee0d4';
  const containerLow = isDarkMode ? '#2c2c2c' : '#fff1e5';

  const getStepLevel = () => {
    if (simStatus === 'Delivered') return 4;
    if (simStatus === 'Delivering') return 3;
    if (simStatus === 'Preparing') return 2;
    return 1; // Pending
  };
  const step = getStepLevel();

  const renderStep = (num, icon, label) => {
    const isActive = step >= num;
    const isCurrent = step === num;
    return (
      <View style={styles.stepItem} key={`step-${num}`}>
        <View style={[
          styles.stepIconWrap, 
          isActive ? { backgroundColor: primaryColor } : { backgroundColor: borderCol },
          isCurrent && { borderWidth: 4, borderColor: primaryFixed }
        ]}>
          <MaterialCommunityIcons name={icon} size={20} color={isActive ? '#fff' : textMuted} />
        </View>
        <Text style={[styles.stepLabel, { color: isCurrent ? primaryColor : textMuted }, isCurrent && { fontWeight: 'bold' }]}>
          {label}
        </Text>
      </View>
    );
  };

  const getStatusText = () => {
    if (step === 4) return 'Pesanan Telah Sampai';
    if (step === 3) return 'Sopir Sedang Menuju Lokasi';
    if (step === 2) return 'Restoran Sedang Menyiapkan';
    return 'Menunggu Konfirmasi';
  };

  const getSubtext = () => {
    if (step === 4) return 'Selesai';
    if (step === 3) return 'Tiba dalam 8 Menit';
    if (step === 2) return 'Estimasi 15 Menit';
    return 'Pesanan Diterima';
  };

  const subtotal = order.total || 0;
  const deliveryFee = 12000;
  const serviceFee = 2000;
  const finalTotal = subtotal + deliveryFee + serviceFee;

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <View style={[styles.mapWrap, { bottom: VISIBLE_WHEN_COLLAPSED }]}>
        <MapComponent 
          latitude={driverLoc.latitude} 
          longitude={driverLoc.longitude} 
          height={height - VISIBLE_WHEN_COLLAPSED}
          isDarkMode={isDarkMode}
          locationName={isPreparing ? 'Restoran' : 'Kurir'}
          showRoute={true}
          destinationLoc={userLocation}
          interactive={false}
          driverMode={simStatus === 'Delivering'}
        />
        {/* Gradient overlay to blend map with sheet visually */}
        <View style={styles.mapGradient} />
      </View>

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: bgSurface }]} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: primaryColor }]}>Pelacakan Pesanan Anda</Text>
        <TouchableOpacity style={[styles.helpBtn, { backgroundColor: bgSurface }]}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Draggable Bottom Sheet */}
      <Animated.View 
        style={[styles.bottomSheet, { height: SHEET_HEIGHT, transform: [{ translateY: sheetTranslateY }], backgroundColor: bgSurface }]}
      >
        {/* Drag Handle / Arrow Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={toggleSheet} 
          accessibilityLabel="toggle-sheet"
          hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
          {...panResponder.panHandlers} 
          style={styles.dragHandleWrap}
        >
          <View style={styles.dragHandle} />
          <Animated.View style={{ transform: [{ rotate: arrowRotation }], marginTop: 12 }}>
            <MaterialCommunityIcons name="chevron-down" size={32} color={textMuted} />
          </Animated.View>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
          
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View style={styles.statusRow}>
              <Text style={styles.statusBadge}>STATUS PENGIRIMAN</Text>
              <Text style={[styles.statusMain, { color: primaryColor }]}>{getStatusText()}</Text>
            </View>
            <Text style={[styles.statusTime, { color: textPrimary }]}>{getSubtext()}</Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <View style={[styles.timelineLine, { backgroundColor: borderCol }]}>
              <View style={[styles.timelineProgress, { backgroundColor: primaryColor, width: `${(step - 1) * 33.33}%` }]} />
            </View>
            {renderStep(1, 'receipt', 'Pesanan\nDiterima')}
            {renderStep(2, 'pot-steam', 'Sedang\nDimasak')}
            {renderStep(3, 'moped', 'Dalam\nPerjalanan')}
            {renderStep(4, 'check-circle', 'Selesai')}
          </View>

          {/* Courier Card */}
          {step >= 3 && (
            <View style={[styles.courierCard, { backgroundColor: containerLow }]}>
              <View style={styles.courierAvatarWrap}>
                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3753/3753265.png' }} style={styles.courierAvatar} />
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={12} color="#fff" />
                </View>
              </View>
              <View style={styles.courierInfo}>
                <Text style={[styles.courierName, { color: textPrimary }]}>Budi Darmawan</Text>
                <View style={styles.courierRatingRow}>
                  <MaterialCommunityIcons name="star" size={16} color="#785831" />
                  <Text style={[styles.courierRating, { color: textMuted }]}>4.9 • Honda Vario (B 1234 ABC)</Text>
                </View>
              </View>
              <View style={styles.courierActions}>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: borderCol }]}>
                  <MaterialCommunityIcons name="chat" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: borderCol }]}>
                  <MaterialCommunityIcons name="phone" size={20} color={primaryColor} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Order Details */}
          <View style={[styles.orderDetails, { borderTopColor: borderCol }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: textPrimary }]}>Detail Pesanan</Text>
              <Text style={[styles.orderNumber, { color: primaryColor }]}>#{order.order_number || 'QB-88291'}</Text>
            </View>

            {(order.items || []).map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                {/* Fallback image added to handle CORS missing images without completely breaking */}
                <Image 
                  source={{ uri: item.image || 'https://via.placeholder.com/48' }} 
                  style={styles.itemImage} 
                  defaultSource={{ uri: 'https://via.placeholder.com/48' }}
                />
                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <Text style={[styles.itemName, { color: textPrimary }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.itemPrice, { color: textPrimary }]}>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</Text>
                  </View>
                  <Text style={[styles.itemDesc, { color: textMuted }]}>{item.quantity}x</Text>
                </View>
              </View>
            ))}

            <View style={[styles.summaryBox, { borderBottomColor: borderCol }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textMuted }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: textPrimary }]}>Rp {subtotal.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textMuted }]}>Ongkos Kirim</Text>
                <Text style={[styles.summaryValue, { color: textPrimary }]}>Rp {deliveryFee.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: textMuted }]}>Biaya Layanan</Text>
                <Text style={[styles.summaryValue, { color: textPrimary }]}>Rp {serviceFee.toLocaleString('id-ID')}</Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: textPrimary }]}>Total Pembayaran</Text>
              <Text style={[styles.totalValue, { color: primaryColor }]}>Rp {finalTotal.toLocaleString('id-ID')}</Text>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: primaryColor }]}>
              <Text style={styles.btnPrimaryText}>Hubungi CS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSecondary, { borderColor: primaryColor }]}>
              <Text style={[styles.btnSecondaryText, { color: primaryColor }]}>Batalkan</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f4' },
  mapWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 140 },
  mapGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'transparent' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, zIndex: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, overflow: 'hidden' },
  helpBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.15, shadowRadius: 24, elevation: 20 },
  dragHandleWrap: { width: '100%', alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  dragHandle: { width: 50, height: 5, backgroundColor: '#d1d5db', borderRadius: 3 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 60 },
  
  statusHeader: { marginBottom: 24 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { fontSize: 12, fontWeight: '600', color: '#524536', letterSpacing: 1 },
  statusMain: { fontSize: 14, fontWeight: '700' },
  statusTime: { fontSize: 24, fontWeight: '700' },
  
  timelineContainer: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative', marginBottom: 32 },
  timelineLine: { position: 'absolute', top: 20, left: '10%', right: '10%', height: 2 },
  timelineProgress: { height: '100%' },
  stepItem: { width: '25%', alignItems: 'center' },
  stepIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, zIndex: 2 },
  stepLabel: { fontSize: 10, textAlign: 'center', lineHeight: 14 },
  
  courierCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24 },
  courierAvatarWrap: { position: 'relative', width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#fff' },
  courierAvatar: { width: '100%', height: '100%', borderRadius: 28 },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#fed3a1', borderRadius: 10, padding: 2, borderWidth: 1, borderColor: '#fff' },
  courierInfo: { flex: 1, marginLeft: 12 },
  courierName: { fontSize: 16, fontWeight: '600' },
  courierRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  courierRating: { fontSize: 12, marginLeft: 4 },
  courierActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  
  orderDetails: { borderTopWidth: 1, paddingTop: 24 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailTitle: { fontSize: 16, fontWeight: '600' },
  orderNumber: { fontSize: 12, fontWeight: '700' },
  
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#eee' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '500', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  itemDesc: { fontSize: 12 },
  
  summaryBox: { borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  
  bottomButtons: { flexDirection: 'row', gap: 12, marginTop: 32 },
  btnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnSecondary: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, alignItems: 'center', backgroundColor: '#fff' },
  btnSecondaryText: { fontWeight: '700', fontSize: 16 },
});

export default DeliveryTrackerScreen;
