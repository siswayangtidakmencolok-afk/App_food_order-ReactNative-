// src/components/AIChatBubble.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useApp } from '../context/AppContext';
import { sendMessageToGemini } from '../services/geminiService';
import { sendMessageToLocalAI } from '../services/localAIService';

const { width, height } = Dimensions.get('window');

const AIChatBubble = () => {
  const { menuItems, cart, addToCart, userProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', text: 'Halo Sobat Kuliner! Saya Street Chef. Ada yang bisa saya bantu hari ini? 👨‍🍳' }
  ]);
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const chatAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  const toggleChat = () => {
    if (isOpen) {
      Animated.timing(chatAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.spring(chatAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setChat(prev => [...prev, userMsg]);
    const inputMessage = message;
    setMessage('');
    setLoading(true);

    // Susun konteks menu secara dinamis dari database
    const menuContext = menuItems && menuItems.length > 0 
      ? menuItems.map(item => `- ${item.name} (${item.category}): Rp ${item.price} - ${item.description || 'Tidak ada deskripsi'}`).join('\n')
      : '- Nasi Goreng Spesial (Makanan Utama): Rp 25000 - Nasi goreng dengan telur, ayam, dan sayuran\n- Mie Goreng (Makanan Utama): Rp 20000 - Mie goreng pedas dengan telur dan sayuran\n- Ayam Goreng Kriuk (Makanan Utama): Rp 30000 - Ayam goreng renyah dengan bumbu special\n- Es Teh Manis (Minuman): Rp 5000 - Es teh manis segar\n- Jus Jeruk (Minuman): Rp 12000 - Jus jeruk segar tanpa gula tambahan\n- Sate Ayam (Makanan Utama): Rp 28000 - Sate ayam dengan bumbu kacang';

    // Susun konteks keranjang belanja saat ini
    const cartContext = cart && cart.length > 0
      ? cart.map(item => `- ${item.name}: ${item.quantity} porsi x Rp ${item.price}`).join('\n')
      : 'Keranjang belanja saat ini kosong.';

    // Susun profil pengguna jika masuk
    const userContext = userProfile 
      ? `Nama Pengguna: ${userProfile.name || 'Sobat Kuliner'}\nEmail: ${userProfile.email || '-'}`
      : 'Pengguna belum login (Tamu).';

    const appContextData = `
=== DETAIL MENU YANG TERSEDIA DI FOODSSTREETS ===
${menuContext}

=== KERANJANG BELANJA PENGGUNA SAAT INI ===
${cartContext}

=== PROFIL PENGGUNA ===
${userContext}

=== INSTRUKSI KHUSUS PEMBELIAN ===
Jika pengguna meminta untuk membeli, memesan, mencicipi, atau menambahkan makanan/minuman tertentu ke keranjang belanja:
1. Anda wajib menyertakan tag aksi ini secara rahasia di bagian akhir respon Anda: [ACTION: ADD_TO_CART: Nama Menu Tepat Sesuai Daftar Menu]
2. Contoh: Jika mereka ingin memesan Es Teh Manis, tambahkan "[ACTION: ADD_TO_CART: Es Teh Manis]" di paling akhir kalimat respon Anda.
3. Pastikan Nama Menu TEPAT sama dengan nama menu di daftar menu yang tersedia di atas. Jangan disingkat atau diubah.
`;

    let aiResponse = '';
    try {
      if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
        const chatHistoryForGemini = chat.map(c => ({
          role: c.role === 'user' ? 'user' : 'ai',
          text: c.text
        }));
        aiResponse = await sendMessageToGemini(inputMessage, chatHistoryForGemini, appContextData);
      } else {
        aiResponse = await sendMessageToLocalAI(inputMessage);
      }
    } catch (e) {
      console.warn('[Gemini Error, switching to Local AI]', e);
      aiResponse = await sendMessageToLocalAI(inputMessage);
    }

    // Parsing action untuk ADD_TO_CART
    const addToCartRegex = /\[ACTION:\s*ADD_TO_CART:\s*([^\]]+)\]/i;
    const match = aiResponse.match(addToCartRegex);
    if (match) {
      const menuName = match[1].trim();
      // Cari menu berdasarkan nama (case-insensitive)
      let foundItem = menuItems.find(item => item.name.toLowerCase() === menuName.toLowerCase());
      
      // Jika tidak ditemukan di database menuItems, coba cari di data lokal
      if (!foundItem) {
        const localFallbackMenu = [
          { id: 1, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
          { id: 2, name: 'Mie Goreng', price: 20000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
          { id: 3, name: 'Ayam Goreng Kriuk', price: 30000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
          { id: 4, name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
          { id: 5, name: 'Jus Jeruk', price: 12000, category: 'Minuman', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
          { id: 6, name: 'Sate Ayam', price: 28000, category: 'Makanan Utama', image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=400' }
        ];
        foundItem = localFallbackMenu.find(item => item.name.toLowerCase() === menuName.toLowerCase());
      }

      if (foundItem) {
        addToCart({
          id: foundItem.id,
          name: foundItem.name,
          price: foundItem.price,
          image: foundItem.image_url || foundItem.image,
          category: foundItem.category
        });
      }
      // Hapus tag action dari respon agar tidak terlihat oleh pengguna
      aiResponse = aiResponse.replace(addToCartRegex, '').trim();
    }

    setChat(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    // Kirim pesan saat Enter ditekan (khusus Web/Laptop)
    // Shift+Enter tetap baris baru
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [chat, isOpen]);

  const bubbleTransform = {
    transform: [{ scale: scaleAnim }]
  };

  const chatTransform = {
    transform: [
      { scale: chatAnim },
      { translateY: chatAnim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) }
    ],
    opacity: chatAnim
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Tombol Gelembung */}
      {!isOpen && (
        <Animated.View style={[styles.bubbleWrapper, bubbleTransform]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleChat}
            style={styles.bubble}
          >
            <View style={styles.metallicOverlay} />
            <MaterialCommunityIcons name="chef-hat" size={24} color="#000" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Jendela Chat */}
      {isOpen && (
        <Animated.View style={[styles.chatWindow, chatTransform]}>
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <MaterialCommunityIcons name="chef-hat" size={24} color="#FFD700" />
              <Text style={styles.headerTitle}>Street Chef</Text>
            </View>
            <TouchableOpacity onPress={toggleChat}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messageArea}
            contentContainerStyle={styles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            {chat.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.msgBubble,
                  item.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={[
                  styles.msgText,
                  item.role === 'user' ? styles.userText : styles.aiText
                ]}>
                  {item.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.msgBubble, styles.aiBubble, { width: 60 }]}>
                <ActivityIndicator color="#FF8C00" size="small" />
              </View>
            )}
          </ScrollView>

          <KeyboardAvoidingView
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
             keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                placeholder="Tanya Street Chef..."
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                multiline
                onKeyPress={handleKeyPress}
                blurOnSubmit={false}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <MaterialCommunityIcons name="send" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
    zIndex: 9999,
  },
  bubbleWrapper: {
    position: 'absolute',
    bottom: 80, // Slightly lower for more compactness
    right: 15,
  },
  bubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  metallicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    borderWidth: 1.2,
    borderColor: '#FF6B00',
  },
  chatWindow: {
    position: 'absolute',
    bottom: 20,
    right: 15,
    width: width > 400 ? 340 : width * 0.85,
    height: 400,
    maxHeight: height * 0.6,
    backgroundColor: 'rgba(30, 30, 30, 0.98)', // Minimalist Dark
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#FFD700', fontWeight: '900', fontSize: 18 },
  messageArea: { flex: 1, padding: 15 },
  messageContent: { paddingBottom: 20 },
  msgBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#eee',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#444',
    borderBottomLeftRadius: 2,
  },
  msgText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#000' },
  aiText: { color: '#fff' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#222',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  input: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default AIChatBubble;
