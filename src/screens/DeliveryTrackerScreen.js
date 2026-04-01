import { useEffect, useMemo, useState, useRef } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import MapComponent from '../components/MapComponent';
import { GEOAPIFY_KEY } from '../config/maps';

const { width } = Dimensions.get('window');

const DeliveryTrackerScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const { isDarkMode, menuItems, userLocation, updateOrder } = useApp();

  const getInitialTab = () => {
    if (order.status === 'Delivered') return 'Selesai';
    if (order.status === 'Delivering') return 'Akan diterima';
    return 'Untuk dikirim';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // ── Simulation State ──
  const RESTAURANT_LOC = { latitude: -6.2000, longitude: 106.8400 };
  const [driverLoc, setDriverLoc] = useState(RESTAURANT_LOC);
  const [simStatus, setSimStatus] = useState(order.status);
  const [isPreparing, setIsPreparing] = useState(true);
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
    // 1. Menyiapkan (Simulasi masak selama 4 detik)
    setTimeout(() => {
      setIsPreparing(false);
      setSimStatus('Delivering');
      setActiveTab('Akan diterima');

      // 2. Drive along road (Simulasi perjalanan)
      let currentIdx = 0;
      // Tingkatkan interval agar gerakan terlihat lebih alami dan tidak terlalu cepat
      const moveInterval = setInterval(() => {
        if (currentIdx < coords.length) {
          setDriverLoc(coords[currentIdx]);
          currentIdx++;
          
          // Jika sudah mendekati akhir, perlambat sedikit (opsional)
        } else {
          clearInterval(moveInterval);
          setTimeout(finishOrder, 1000);
        }
      }, 300); // Gerakan setiap 300ms agar lebih smooth di peta
    }, 4000);
  };

  const finishOrder = () => {
    setSimStatus('Delivered');
    setActiveTab('Selesai');
    Alert.alert('🎉 Pesanan Sampai!', 'Kurir sudah sampai di lokasi tujuan Anda. Selamat menikmati!');
  };

  // Tampilan warna
  const bg = isDarkMode ? '#121212' : '#f5f5f5';
  const cardBg = isDarkMode ? '#1e1e1e' : '#fff';
  const textPrimary = isDarkMode ? '#fff' : '#000';
  const textSecondary = isDarkMode ? '#aaa' : '#666';

  const TABS = ['Perlu dibayar', 'Untuk dikirim', 'Akan diterima', 'Selesai'];

  const recommendations = useMemo(() => {
    const pool = (menuItems || []).slice(0, 4);
    return pool.sort(() => Math.random() - 0.5);
  }, [menuItems]);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* ── Tabs ala Shopee ── */}
      <View style={{ backgroundColor: cardBg, flexDirection: 'row', borderBottomWidth: 1, borderColor: isDarkMode ? '#333' : '#eee' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
              <Text style={[styles.tabText, { color: activeTab === tab ? '#EE4D2D' : textSecondary }, activeTab === tab && { fontWeight: 'bold' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }}>
        
        {/* Guard Logic: Hanya tampilkan card jika tab AKTIF sesuai dengan status SIMULASI */}
        {(activeTab === 'Untuk dikirim' && isPreparing) || 
         (activeTab === 'Akan diterima' && simStatus === 'Delivering') || 
         (activeTab === 'Selesai' && simStatus === 'Delivered') ? (
          
          <View>
            <View style={styles.banner}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#EE4D2D" />
              <Text style={styles.bannerText}>Jaminan makanan segar & tepat waktu</Text>
            </View>

            <View style={[styles.orderCard, { backgroundColor: cardBg }]}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.mallBadge}><Text style={styles.mallBadgeText}>Mall</Text></View>
                  <Text style={[styles.storeName, { color: textPrimary }]}>FoodsStreets Official</Text>
                </View>
                <Text style={styles.statusText}>
                  {isPreparing ? 'Menyiapkan' : (simStatus === 'Delivered' ? 'Selesai' : 'Sedang Dijalan')}
                </Text>
              </View>

              {/* Map Routing Real-time */}
              <View style={styles.mapContainer}>
                <MapComponent 
                  latitude={driverLoc.latitude} 
                  longitude={driverLoc.longitude} 
                  height={220}
                  isDarkMode={isDarkMode}
                  locationName={isPreparing ? 'Restoran' : 'E-Kurir'}
                  showRoute={true}
                  destinationLoc={userLocation}
                  interactive={false}
                />
                {isPreparing && (
                  <View style={styles.prepOverlay}>
                    <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#EE4D2D" />
                    <Text style={styles.prepText}>Proses Memasak...</Text>
                  </View>
                )}
              </View>

              {/* Information */}
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#EE4D2D" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.infoTitle, { color: textPrimary }]}>Alamat Tujuan</Text>
                  <Text style={[styles.infoSub, { color: textSecondary }]} numberOfLines={1}>{userLocation.address}</Text>
                </View>
              </View>

              {/* Items */}
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: textPrimary }]}>{item.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={{ color: textSecondary }}>x{item.quantity}</Text>
                      <Text style={{ color: '#EE4D2D', fontWeight: 'bold' }}>Rp {item.price.toLocaleString('id-ID')}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={{ color: textSecondary }}>Total Pesanan:</Text>
                <Text style={styles.totalValue}>Rp {order.total.toLocaleString('id-ID')}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} style={styles.emptyIcon} />
            <Text style={{ color: textSecondary, marginTop: 15 }}>Tidak ada pesanan di tab ini</Text>
          </View>
        )}

        {/* Rekomendasi */}
        <View style={styles.recomSection}>
          <Text style={[styles.recomTitle, { color: textPrimary }]}>Mungkin Anda suka ini</Text>
          <View style={styles.recomGrid}>
            {recommendations.map(item => (
              <TouchableOpacity key={item.id} style={[styles.recomCard, { backgroundColor: cardBg }]}>
                <Image source={{ uri: item.image }} style={styles.recomImage} />
                <View style={{ padding: 10 }}>
                  <Text style={[styles.recomName, { color: textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recomPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tab: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#EE4D2D' },
  tabText: { fontSize: 14, fontWeight: '500' },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 12, marginBottom: 1 },
  bannerText: { color: '#EE4D2D', fontSize: 12, marginLeft: 8, fontWeight: '500' },
  orderCard: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  mallBadge: { backgroundColor: '#d0011b', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, marginRight: 6 },
  mallBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  storeName: { fontSize: 15, fontWeight: 'bold' },
  statusText: { fontSize: 14, color: '#EE4D2D', fontWeight: 'bold' },
  mapContainer: { height: 220, borderRadius: 15, overflow: 'hidden', marginBottom: 20, position: 'relative' },
  prepOverlay: {
    position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 5
  },
  prepText: { fontSize: 12, fontWeight: 'bold', color: '#EE4D2D' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 10 },
  infoTitle: { fontSize: 13, fontWeight: 'bold' },
  infoSub: { fontSize: 12 },
  itemRow: { flexDirection: 'row', marginBottom: 15 },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#EE4D2D' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { width: 100, height: 100, opacity: 0.5 },
  recomSection: { padding: 16 },
  recomTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  recomGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recomCard: { width: (width - 48) / 2, borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  recomImage: { width: '100%', height: 120 },
  recomName: { fontSize: 13, fontWeight: '600', marginBottom: 5 },
  recomPrice: { fontSize: 14, fontWeight: 'bold', color: '#EE4D2D' }
});

export default DeliveryTrackerScreen;