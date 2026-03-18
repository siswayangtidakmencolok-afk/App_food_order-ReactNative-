import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { addReview, getMenuReviews } from '../features/reviews';

export default function MenuReview({ menu_item_id, user_id, user_name }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState([]);

  // Fetch reviews when menu changes
  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await getMenuReviews(menu_item_id);
      if (!error) setReviews(data);
    }
    fetchReviews();
  }, [menu_item_id]);
  const handleSubmit = async () => {
  // Cek apakah sudah ada review
  const { data: existingReview, error: reviewError } = await getUserReviewForMenu(menu_item_id, user_id);
  if (existingReview) {
    alert("Kamu sudah pernah memberikan review untuk menu ini.");
    return;
  }
  
  if (rating < 1 || rating > 5) {
    alert('Rating harus 1-5');
    return;
  }
  
  // lanjut insert seperti biasa
  const { data, error } = await addReview(menu_item_id, user_id, rating, text, user_name);
  if (error) {
    if (error.code === '23505') { // kode error PostgreSQL untuk UNIQUE violation
      alert("Kamu sudah pernah review menu ini!");
    } else {
      alert(error.message);
    }
    return;
  }

  // Fetch ulang review jika perlu
  const { data: allReviews, error: fetchError } = await getMenuReviews(menu_item_id);
  setText('');
  setRating(5);
  if (fetchError) alert(fetchError.message)
  else setReviews(allReviews || []);
};

  return (
    <View style={{ margin: 16 }}>
      <Text>Berikan Rating & Komentar:</Text>
      <Text>Rating (1-5):</Text>
      <TextInput
        value={String(rating)}
        keyboardType="numeric"
        onChangeText={v => setRating(Number(v))}
        style={{ borderWidth: 1, marginVertical: 4 }}
      />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Tulis komentar..."
        style={{ borderWidth: 1, marginVertical: 4 }}
      />
      <Button title="Kirim Review" onPress={handleSubmit} />
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Daftar Review:</Text>
      <FlatList
        data={reviews}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ borderBottomWidth: 1, marginVertical: 4 }}>
            <Text>{item.user_name || 'User'} | Rating: {item.rating}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}