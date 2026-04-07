// src/screens/MenuDetailScreen.js
// Screen detail menu dengan sistem review + reply realtime dari Supabase

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
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
import { supabase } from '../config/supabase';
import { useApp } from '../context/AppContext';
import { getViralInfoForMenuItem } from '../services/qdrantService';

// ─── Komponen Reply Item ──────────────────────────────────────
// Menampilkan satu reply dari user
const ReplyItem = ({ reply, currentUserId, onDelete, textCol, subText, bg }) => (
  <View style={[styles.replyCard, { backgroundColor: bg }]}>
    <View style={styles.replyHeader}>
      {/* Avatar huruf pertama */}
      <View style={[styles.replyAvatar, { backgroundColor: '#2196F3' }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
          {(reply.user_name || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.replyUser, { color: textCol }]}>
            {reply.user_name || 'User'}
          </Text>
          {/* Badge "Kamu" kalau reply milik user yang login */}
          {reply.user_id === currentUserId && (
            <Text style={styles.myBadge}> • Kamu</Text>
          )}
        </View>
        <Text style={{ color: subText, fontSize: 10 }}>
          {new Date(reply.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
          })}
        </Text>
      </View>
      {/* Tombol hapus — hanya muncul untuk reply milik user sendiri */}
      {reply.user_id === currentUserId && (
        <TouchableOpacity onPress={() => onDelete(reply.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: '#ff4444', fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
    <Text style={[styles.replyText, { color: subText }]}>{reply.text}</Text>
  </View>
);

// ─── Komponen Review Item + Reply ────────────────────────────
// Menampilkan satu review beserta semua reply-nya
const ReviewItem = ({ review, currentUserId, session, userProfile, textCol, subText, bg, card }) => {
  const [replies, setReplies]           = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies]   = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText]       = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // ── Fetch replies untuk review ini ────────────────────
  const fetchReplies = async () => {
    setLoadingReplies(true);
    const { data, error } = await supabase
      .from('review_replies')
      .select('*')
      .eq('review_id', review.id)
      .order('created_at', { ascending: true }); // reply lama di atas

    if (!error && data) setReplies(data);
    setLoadingReplies(false);
  };

  // ── Realtime listener untuk reply ─────────────────────
  useEffect(() => {
    if (!showReplies) return;
    fetchReplies();

    const channel = supabase
      .channel(`replies-${review.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'review_replies',
        filter: `review_id=eq.${review.id}`,
      }, () => fetchReplies())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [showReplies, review.id]);

  // ── Toggle tampilan replies ────────────────────────────
  const handleToggleReplies = () => {
    setShowReplies(prev => !prev);
  };

  // ── Submit reply baru ──────────────────────────────────
  const handleSubmitReply = async () => {
    if (!session?.user) {
      Alert.alert('Login Dulu', 'Kamu harus login untuk membalas.');
      return;
    }
    if (replyText.trim() === '') {
      Alert.alert('Error', 'Balasan tidak boleh kosong!');
      return;
    }

    setSubmittingReply(true);

    const { error } = await supabase
      .from('review_replies')
      .insert({
        review_id: review.id,
        user_id:   session.user.id,
        user_name: userProfile?.name || session.user.email?.split('@')[0] || 'User',
        text:      replyText.trim(),
      });

    if (error) {
      Alert.alert('Error', 'Gagal mengirim balasan: ' + error.message);
    } else {
      setReplyText('');
      setShowReplyForm(false);
      setShowReplies(true); // otomatis buka list reply
      fetchReplies();
    }

    setSubmittingReply(false);
  };

  // ── Hapus reply ────────────────────────────────────────
  const handleDeleteReply = async (replyId) => {
    Alert.alert('Hapus Balasan', 'Yakin ingin menghapus balasan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('review_replies')
            .delete()
            .eq('id', replyId);
          if (!error) fetchReplies();
        }
      }
    ]);
  };

  // ── Render bintang read-only ───────────────────────────
  const renderStars = (rating) => (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Text key={star} style={{ fontSize: 12 }}>
          {star <= rating ? '⭐' : '☆'}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={[styles.reviewCard, { backgroundColor: card }]}>
      {/* ── Header Review ── */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {(review.user_name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.reviewUser, { color: textCol }]}>
              {review.user_name || 'User'}
            </Text>
            {review.user_id === currentUserId && (
              <Text style={styles.myBadge}> • Kamu</Text>
            )}
          </View>
          <Text style={{ color: subText, fontSize: 11 }}>
            {new Date(review.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Text>
        </View>
        {renderStars(review.rating)}
      </View>

      {/* ── Teks Review ── */}
      <Text style={[styles.reviewText, { color: subText }]}>{review.text}</Text>

      {/* ── Action Bar ── */}
      <View style={styles.replyActionBar}>
        {/* Tombol lihat/sembunyikan reply */}
        <TouchableOpacity
          style={styles.replyToggleBtn}
          onPress={handleToggleReplies}
        >
          <Text style={[styles.replyToggleTxt, { color: '#2196F3' }]}>
            {showReplies
              ? '🔼 Sembunyikan balasan'
              : `💬 ${replies.length > 0 ? `${replies.length} balasan` : 'Balas'}`}
          </Text>
        </TouchableOpacity>

        {/* Tombol tulis reply */}
        {session?.user && (
          <TouchableOpacity
            style={styles.replyToggleBtn}
            onPress={() => setShowReplyForm(prev => !prev)}
          >
            <Text style={[styles.replyToggleTxt, { color: '#FF6347' }]}>
              {showReplyForm ? '✕ Batal' : '↩️ Balas'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Form Reply ── */}
      {showReplyForm && (
        <View style={[styles.replyForm, { backgroundColor: bg }]}>
          <TextInput
            style={[styles.replyInput, { color: textCol, borderColor: '#e0e0e0' }]}
            placeholder={`Balas ${review.user_name || 'user'}...`}
            placeholderTextColor={subText}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            autoFocus
          />
          <TouchableOpacity
            style={[styles.replySendBtn, { opacity: submittingReply ? 0.7 : 1 }]}
            onPress={handleSubmitReply}
            disabled={submittingReply}
          >
            <Text style={styles.replySendTxt}>
              {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List Reply ── */}
      {showReplies && (
        <View style={styles.repliesList}>
          {loadingReplies ? (
            <Text style={{ color: subText, fontSize: 12, fontStyle: 'italic' }}>
              Memuat balasan...
            </Text>
          ) : replies.length === 0 ? (
            <Text style={{ color: subText, fontSize: 12, fontStyle: 'italic' }}>
              Belum ada balasan
            </Text>
          ) : (
            replies.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onDelete={handleDeleteReply}
                textCol={textCol}
                subText={subText}
                bg={bg}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const MenuDetailScreen = ({ route }) => {
  const { item } = route.params;
  const { isDarkMode, saveReview, session, userProfile } = useApp();
  // scrollY untuk parallax animasi gambar (harus Animated.Value)
  const animatedScrollY = useRef(new Animated.Value(0)).current;

  const [userRating, setUserRating]         = useState(0);
  const [reviewText, setReviewText]         = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [reviews, setReviews]               = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [existingReview, setExistingReview] = useState(null);

  // AI Viral Insights
  const [viralTrend, setViralTrend] = useState(null);

  useEffect(() => {
    const trend = getViralInfoForMenuItem(item);
    if (trend) setViralTrend(trend);
  }, [item.id]);

  // Theme colors
  const bg      = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const card    = isDarkMode ? '#2a2a2a' : '#ffffff';
  const textCol = isDarkMode ? '#ffffff' : '#333333';
  const subText = isDarkMode ? '#aaaaaa' : '#666666';

  // ── Fetch reviews ──────────────────────────────────────
  const fetchReviews = async () => {
    setLoadingReviews(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('menu_item_id', item.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      if (session?.user) {
        const myReview = data.find(r => r.user_id === session.user.id);
        if (myReview) {
          setExistingReview(myReview);
          setUserRating(myReview.rating);
          setReviewText(myReview.text || '');
        }
      }
    }
    setLoadingReviews(false);
  };

  // ── Realtime untuk review ──────────────────────────────
  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel(`reviews-menu-${item.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `menu_item_id=eq.${item.id}`,
      }, () => fetchReviews())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [item.id]);

  // ── Submit review ──────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!session?.user) {
      Alert.alert('Login Dulu', 'Kamu harus login untuk memberikan review.');
      return;
    }
    if (userRating === 0) { Alert.alert('Error', 'Pilih rating!'); return; }
    if (!reviewText.trim()) { Alert.alert('Error', 'Tulis review dulu!'); return; }

    setSubmitting(true);

    if (existingReview) {
      const { error } = await supabase
        .from('reviews')
        .update({ rating: userRating, text: reviewText })
        .eq('id', existingReview.id);
      if (error) Alert.alert('Error', error.message);
      else { Alert.alert('Berhasil!', 'Review diperbarui'); fetchReviews(); }
    } else {
      const { error } = await saveReview({
        menuItemId: item.id,
        rating: userRating,
        text: reviewText,
      });
      if (error) Alert.alert('Error', error.message);
      else {
        Alert.alert('Berhasil!', 'Review terkirim! 🎉');
        setUserRating(0);
        setReviewText('');
        fetchReviews();
      }
    }

    setSubmitting(false);
  };

  // ── Stars interaktif ───────────────────────────────────
  const renderInteractiveStars = () => (
    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
          <Text style={{ fontSize: 32, marginRight: 4 }}>
            {star <= userRating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (item.rating || 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={(e) => {
          // Forward scroll event ke animated value untuk parallax
          animatedScrollY.setValue(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        {/* Gambar parallax */}
        <Animated.Image
          source={{ uri: item.image }}
          style={[styles.image, {
            transform: [{
              translateY: animatedScrollY.interpolate({
                inputRange: [-250, 0, 250],
                outputRange: [-125, 0, 125],
                extrapolate: 'clamp',
              })
            }]
          }]}
        />

        {/* Info makanan */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: textCol }]}>{item.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.price}>
              Rp {(item.price || 0).toLocaleString('id-ID')}
            </Text>
          </View>
          <Text style={[styles.description, { color: subText }]}>
            {item.description}
          </Text>
 
          {/* Rating summary */}
          <View style={[styles.ratingBox, { backgroundColor: bg }]}>
            <Text style={[styles.ratingNum, { color: textCol }]}>{avgRating}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Text key={s} style={{ fontSize: 16 }}>
                  {s <= Math.floor(avgRating) ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={[styles.ratingCount, { color: subText }]}>
              {reviews.length} ulasan
            </Text>
          </View>
 
          {/* ⚡ AI Viral Insight Card ⚡ */}
          {viralTrend && (
            <LinearGradient
              colors={isDarkMode ? ['#4c1d95', '#1e1b4b'] : ['#f5f3ff', '#ede9fe']}
              style={styles.viralInsightCard}
            >
              <View style={styles.viralInsightHeader}>
                <View style={styles.aiIconBadge}>
                  <MaterialCommunityIcons name="brain" size={16} color="#8b5cf6" />
                </View>
                <Text style={[styles.viralInsightTitle, { color: isDarkMode ? '#ddd' : '#5b21b6' }]}>
                  AI Viral Insight
                </Text>
              </View>
              <Text style={[styles.viralInsightDetail, { color: isDarkMode ? '#bbb' : '#4c1d95' }]}>
                "{viralTrend.description}"
              </Text>
              <View style={styles.viralSourceRow}>
                <Text style={styles.viralSourceTxt}>Sedang Tren di Internet</Text>
                <MaterialCommunityIcons name="trending-up" size={14} color="#8b5cf6" />
              </View>
              
              <TouchableOpacity 
                style={styles.viralSourceBtn}
                onPress={() => WebBrowser.openBrowserAsync(viralTrend.sourceUrl)}
              >
                <Text style={styles.viralSourceBtnTxt}>Lihat Insight Lengkap 🌍</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>

        {/* Form review */}
        <View style={[styles.section, { backgroundColor: card, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            {existingReview ? '✏️ Edit Review Kamu' : '📝 Tulis Review'}
          </Text>

          {!session?.user ? (
            <Text style={{ color: subText, fontStyle: 'italic' }}>
              Login untuk memberikan review
            </Text>
          ) : (
            <>
              <Text style={[styles.label, { color: subText }]}>Rating:</Text>
              {renderInteractiveStars()}
              <Text style={[styles.label, { color: subText }]}>Review:</Text>
              <TextInput
                style={[styles.textArea, { color: textCol }]}
                placeholder="Bagikan pengalaman kamu..."
                placeholderTextColor={subText}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.submitBtn, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? 'Mengirim...' : existingReview ? 'Update Review' : 'Kirim Review'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Daftar review + reply */}
        <View style={[styles.section, { backgroundColor: card, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            💬 Semua Review ({reviews.length})
          </Text>

          {loadingReviews ? (
            <Text style={{ color: subText, fontStyle: 'italic' }}>Memuat review...</Text>
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={{ fontSize: 40 }}>💬</Text>
              <Text style={{ color: subText, marginTop: 8, textAlign: 'center' }}>
                Belum ada review. Jadilah yang pertama!
              </Text>
            </View>
          ) : (
            // Setiap ReviewItem sudah termasuk reply system di dalamnya
            reviews.map(review => (
              <ReviewItem
                key={review.id}
                review={review}
                currentUserId={session?.user?.id}
                session={session}
                userProfile={userProfile}
                textCol={textCol}
                subText={subText}
                bg={bg}
                card={card}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.floatingBackBtn} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  floatingBackBtn:  { position: 'absolute', top: 40, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  image:            { width: '100%', height: 280, resizeMode: 'cover' },
  section:          { padding: 16 },
  headerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name:             { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  categoryBadge:    { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  categoryText:     { fontSize: 12, color: '#1976d2', fontWeight: '600' },
  price:            { fontSize: 24, fontWeight: 'bold', color: '#FF6347' },
  description:      { fontSize: 15, lineHeight: 22, marginBottom: 16 },

  // Viral Insight
  viralInsightCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  viralInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viralInsightTitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viralInsightDetail: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  viralSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viralSourceTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  viralSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    elevation: 3,
  },
  viralSourceBtnTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  ratingBox:        { padding: 16, borderRadius: 12, alignItems: 'center' },
  ratingNum:        { fontSize: 48, fontWeight: 'bold', marginBottom: 4 },
  ratingCount:      { fontSize: 14, marginTop: 4 },
  sectionTitle:     { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label:            { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  textArea:         { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', height: 100, textAlignVertical: 'top', marginBottom: 12 },
  submitBtn:        { backgroundColor: '#FF6347', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyReviews:     { padding: 30, alignItems: 'center' },

  // Review card
  reviewCard:       { borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  reviewHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6347', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  reviewUser:       { fontSize: 14, fontWeight: 'bold' },
  myBadge:          { fontSize: 11, color: '#FF6347', fontWeight: 'bold' },
  reviewText:       { fontSize: 14, lineHeight: 20, marginBottom: 10 },

  // Reply action bar
  replyActionBar:   { flexDirection: 'row', gap: 12, marginTop: 4 },
  replyToggleBtn:   { paddingVertical: 4 },
  replyToggleTxt:   { fontSize: 13, fontWeight: '600' },

  // Reply form
  replyForm:        { marginTop: 10, padding: 12, borderRadius: 10 },
  replyInput:       { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  replySendBtn:     { backgroundColor: '#2196F3', padding: 10, borderRadius: 8, alignItems: 'center' },
  replySendTxt:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Reply list
  repliesList:      { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#e0e0e0' },
  replyCard:        { padding: 10, borderRadius: 8, marginBottom: 8 },
  replyHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  replyAvatar:      { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  replyUser:        { fontSize: 13, fontWeight: 'bold' },
  replyText:        { fontSize: 13, lineHeight: 18 },
});

export default MenuDetailScreen;