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
import { sendMessageToGemini } from '../services/geminiService';

const { width, height } = Dimensions.get('window');

const AIChatBubble = () => {
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
    setMessage('');
    setLoading(true);

    const aiResponse = await sendMessageToGemini(message);
    setChat(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setLoading(false);
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
            <MaterialCommunityIcons name="chef-hat" size={32} color="#000" />
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
    bottom: 80,
    right: 20,
  },
  bubble: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FF8C00', // Deep Orange
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold/Yellow
    overflow: 'hidden',
  },
  metallicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // Efek kilau bisa ditambah dengan gradient jika tersedia
  },
  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // Status Online
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  chatWindow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: width * 0.9,
    maxWidth: 380,
    height: height * 0.6,
    backgroundColor: 'rgba(26, 26, 26, 0.95)', // Black Glass
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
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
