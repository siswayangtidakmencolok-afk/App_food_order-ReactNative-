import { supabase } from '../lib/supabaseClient';

// Fungsi untuk menambah review baru
export async function addReview(menu_item_id, user_id, rating, text, user_name) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ menu_item_id, user_id, rating, text, user_name }])
    .select(); // HAPUS .single()
  if (error) {
    console.error('Gagal menambah review:', error.message);
  }
  // data[0] adalah review terakhir yang ditambahkan
  return { data: data ? data[0] : null, error };
}

// Fungsi untuk mengambil semua review pada satu menu
export async function getMenuReviews(menu_item_id) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('menu_item_id', menu_item_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Gagal mengambil review:', error.message);
  }
  return { data, error };
}