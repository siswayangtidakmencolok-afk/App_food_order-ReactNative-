import { supabase } from '../lib/supabaseClient';

// Ambil review user pada satu menu (untuk validasi 1x review per menu)
export async function getUserReviewForMenu(menu_item_id, user_id) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('menu_item_id', menu_item_id)
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Tambah review baru
export async function addReview(menu_item_id, user_id, rating, text, user_name) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ menu_item_id, user_id, rating, text, user_name }])
    .select();
  if (error) {
    console.log("Insert error:", error.message);
    alert("Insert error: " + error.message);
  }
  return { data: data ? data[0] : null, error };
}

// Update review (opsional, jika user boleh ubah review mereka)
export async function updateReview(review_id, rating, text) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, text })
    .eq('id', review_id)
    .select();
  if (error) {
    console.log("Update error:", error.message);
    alert("Update error: " + error.message);
  }
  return { data: data ? data[0] : null, error };
}

// Ambil semua review untuk satu menu
export async function getMenuReviews(menu_item_id) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('menu_item_id', menu_item_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.log('Gagal mengambil review:', error.message);
  }
  return { data, error };
}