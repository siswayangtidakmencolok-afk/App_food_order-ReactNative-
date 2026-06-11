# 🤖 Copilot Index (AGENTS.md)

File ini adalah titik masuk pertama untuk AI/Copilot. BACA INI DULU sebelum memproses kode.

## 📁 Struktur Utama Proyek
- `src/screens/` → Seluruh halaman UI (React Native).
- `src/components/` → Komponen reusable (GrainientBackground, LogoLoop, dll).
- `src/config/` → Konfigurasi (Supabase, Tema Warna).
- `src/context/` → State Management (AppContext.js).

## 🧭 Panduan Navigasi Cepat AI
Jika user meminta perbaikan pada:
- **Autentikasi (Login/Daftar/OAuth):** Cek `src/screens/AuthScreen.js` dan `src/config/supabase.js`.
- **Profil User & Pengaturan:** Cek `src/screens/ProfileScreen.js`.
- **Riwayat & Detail Pesanan:** Cek `src/screens/OrderHistoryScreen.js`.
- **Keranjang Belanja:** Cek `src/screens/CartScreen.js`.
- **Pelacakan Pengiriman (Peta):** Cek `src/screens/DeliveryTrackerScreen.js`.
- **State Global (User, Cart, dll):** Cek `src/context/AppContext.js`.

## ⚠️ Aturan Khusus Saat Mengedit
1. Jangan merusak animasi `GrainientBackground` atau `LogoLoop` jika tidak diminta.
2. Selalu patuhi standar desain modern (Premium UI) yang sudah ada.
3. React Native Web sangat sensitif terhadap *Text Node* kosong, pastikan tidak ada spasi di dalam `<View>` yang tidak dibungkus `<Text>`.
4. Jangan menghapus komentar dokumentasi lama yang tidak terkait langsung dengan instruksi.

## 📝 Catatan Prompt Terakhir
Project ini menggunakan integrasi backend: Supabase, Midtrans, Fonnte, dan Gemini API.
