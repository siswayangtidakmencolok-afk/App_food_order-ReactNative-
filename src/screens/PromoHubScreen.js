// src/screens/PromoHubScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchAITrends } from '../services/qdrantService';

const { width } = Dimensions.get('window');

const PromoHubScreen = ({ navigation }) => {
  const { menuItems, isDarkMode, addToCart } = useApp();
  const [promoItems, setPromoItems] = useState([]);
  const [aiPick, setAiPick] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromoData = async () => {
      // Simulasi mengambil item yang ada promo Gratis Ongkir
      // Kita ambil menu yang harganya di atas 20k sebagai syarat gratis ongkir
      const filtered = menuItems.filter(item => item.price >= 20000);
      setPromoItems(filtered.slice(0, 8));

      // Ambil rekomendasi AI untuk "Best Value"
      const trends = await fetchAITrends('food', menuItems);
      if (trends.length > 0 && trends[0].matchedMenu) {
        setAiPick(trends[0]);
      }
      setLoading(false);
    };
    loadPromoData();
  }, [menuItems]);

  const bg = isDarkMode ? '#121212' : '#f8f9fa';
  const cardBg = isDarkMode ? '#1e1e1e' : '#fff';
  const textCol = isDarkMode ? '#fff' : '#000';

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      {/* 🎫 Header Banner */}
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.headerBanner}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Gratis Ongkir Hub</Text>
            <Text style={styles.headerSub}>Syarat & Ketentuan Berlaku • Min. 20rb</Text>
          </View>
          <MaterialCommunityIcons name="ticket-percent" size={48} color="rgba(255,255,255,0.5)" />
        </View>
      </LinearGradient>

      {/* 🧠 AI Best Value Pick */}
      {aiPick && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="brain" size={20} color="#8b5cf6" />
            <Text style={[styles.sectionTitle, { color: textCol }]}>AI "Best Value" Pick</Text>
          </View>
          <TouchableOpacity 
            style={[styles.aiCard, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f0f9ff' }]}
            onPress={() => navigation.navigate('Menu', { screen: 'MenuDetail', params: { item: aiPick.matchedMenu } })}
          >
            <Image source={{ uri: aiPick.matchedMenu.image }} style={styles.aiImg} />
            <View style={styles.aiInfo}>
              <Text style={[styles.aiMenuName, { color: textCol }]}>{aiPick.matchedMenu.name}</Text>
              <Text style={styles.aiTrendTag}>⚡ Sedang Viral + Gratis Ongkir</Text>
              <Text style={styles.aiPrice}>Rp {aiPick.matchedMenu.price.toLocaleString('id-ID')}</Text>
              <TouchableOpacity 
                style={styles.buyBtn}
                onPress={() => addToCart(aiPick.matchedMenu)}
              >
                <Text style={styles.buyBtnTxt}>Klaim Promo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 🛵 Free Delivery List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol, marginBottom: 15 }]}>Menu Pilihan Gratis Ongkir</Text>
        <View style={styles.grid}>
          {promoItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemCard, { backgroundColor: cardBg }]}
              onPress={() => navigation.navigate('Menu', { screen: 'MenuDetail', params: { item } })}
            >
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={styles.itemBadge}>
                <Text style={styles.itemBadgeTxt}>FREE ONGKIR</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: textCol }]} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: '#fff', opacity: 0.8, marginTop: 4 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  aiCard: { borderRadius: 20, overflow: 'hidden', flexDirection: 'row', padding: 12, elevation: 4 },
  aiImg: { width: 100, height: 100, borderRadius: 12 },
  aiInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  aiMenuName: { fontSize: 16, fontWeight: 'bold' },
  aiTrendTag: { fontSize: 10, color: '#8b5cf6', fontWeight: '700', marginTop: 4 },
  aiPrice: { fontSize: 18, fontWeight: '900', color: '#FF6347', marginTop: 6 },
  buyBtn: { backgroundColor: '#FFD700', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginTop: 10, alignSelf: 'flex-start' },
  buyBtnTxt: { fontWeight: 'bold', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  itemCard: { width: (width - 60) / 2, borderRadius: 20, marginBottom: 20, elevation: 3, overflow: 'hidden' },
  itemImg: { width: '100%', height: 120 },
  itemBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemBadgeTxt: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  itemInfo: { padding: 12 },
  itemName: { fontSize: 14, fontWeight: '700' },
  itemPrice: { fontSize: 13, color: '#FF6347', fontWeight: '800', marginTop: 4 },
});

export default PromoHubScreen;
