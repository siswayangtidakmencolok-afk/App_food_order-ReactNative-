// src/screens/MenuDetailScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated
} from 'react-native';
import { useApp } from '../context/AppContext';

const MenuDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { isDarkMode } = useApp();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState(item.reviews || []);

  const handleSubmitReview = () => {
    if (userRating === 0) {
      Alert.alert('Error', 'Pilih rating terlebih dahulu!');
      return;
    }
    if (reviewText.trim() === '') {
      Alert.alert('Error', 'Tulis review kamu!');
      return;
    }

    const newReview = {
      id: Date.now(),
      rating: userRating,
      text: reviewText,
      userName: 'User',
      date: new Date().toLocaleDateString('id-ID'),
    };

    setReviews([newReview, ...reviews]);
    
    // Reset form
    setUserRating(0);
    setReviewText('');
    
    Alert.alert('Berhasil!', 'Review kamu berhasil ditambahkan');
  };

  const renderStars = (rating, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={styles.starIcon}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Parallax Food Image */}
        <Animated.Image 
          source={{ uri: item.image }} 
          style={[
            styles.image,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [-250, 0, 250],
                    outputRange: [-125, 0, 125],
                    extrapolate: 'clamp',
                  })
                },
                {
                  scale: scrollY.interpolate({
                    inputRange: [-250, 0],
                    outputRange: [2, 1],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]} 
        />

      {/* Food Info */}
      <View style={styles.infoSection}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {/* Overall Rating */}
        <View style={styles.overallRatingSection}>
          <View style={styles.overallRatingLeft}>
            <Text style={styles.ratingNumber}>{item.rating}</Text>
            {renderStars(Math.floor(item.rating))}
            <Text style={styles.totalReviews}>
              {item.totalReviews} reviews
            </Text>
          </View>
        </View>
      </View>

      {/* Write Review Section */}
      <View style={styles.writeReviewSection}>
        <Text style={styles.sectionTitle}>Tulis Review Kamu</Text>
        
        <Text style={styles.label}>Rating:</Text>
        {renderStars(userRating, setUserRating)}

        <Text style={styles.label}>Review:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Bagikan pengalaman kamu..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmitReview}
        >
          <Text style={styles.submitButtonText}>Kirim Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>
          Semua Reviews ({reviews.length})
        </Text>

        {reviews.length === 0 ? (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyReviewsText}>
              Belum ada review. Jadilah yang pertama!
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.reviewUserName}>{review.userName}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                {renderStars(review.rating)}
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.bottomSpace} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  overallRatingSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  overallRatingLeft: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  writeReviewSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starIcon: {
    fontSize: 32,
    marginRight: 4,
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6347',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  emptyReviews: {
    padding: 30,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomSpace: {
    height: 30,
  },
});

export default MenuDetailScreen;