# 🏛️ Arsitektur Project

Project ini adalah Aplikasi Pemesanan Makanan berbasis **React Native (Expo)** yang dapat berjalan di Mobile (Android/iOS) dan Web.

## 🛠️ Tech Stack
- **Framework Utama:** React Native / Expo.
- **Routing:** React Navigation (Stack & Tab Navigators).
- **Backend & Auth:** Supabase (Database, Auth, OAuth).
- **Payment Gateway:** Midtrans (Setup ada via `.env`).
- **AI / Layanan Lain:** Gemini API, Fonnte Token (terlihat di konfigurasi *env*).
- **Styling:** Vanilla React Native StyleSheet dengan referensi palet warna Tailwind kustom.

## 🧩 Hierarki Folder Pendek
```text
📦 AplikasiPemesananMakanan
 ┣ 📂 .copilot/            # Panduan untuk AI/Copilot
 ┣ 📂 assets/              # Gambar statis, icon, dll.
 ┣ 📂 src/
 ┃ ┣ 📂 components/        # Komponen UI Reusable
 ┃ ┣ 📂 config/            # Tema & Setup Backend (Supabase)
 ┃ ┣ 📂 constants/         # Konstanta Aset/String
 ┃ ┣ 📂 context/           # AppContext (React Context API)
 ┃ ┗ 📂 screens/           # Halaman Aplikasi
 ┣ 📜 App.js               # Entry Point Utama (Navigation & Provider Setup)
 ┗ 📜 package.json         # Dependencies
```

## 🔐 Manajemen State
Menggunakan **React Context API** (`AppContext.js`) untuk memegang *state* global, termasuk:
- `userProfile`
- `orderHistory`
- `favorites`
- `cart`
- `isDarkMode` / Theme Toggle
- Fungsi-fungsi *helper* `updateProfile`, `signOut`, `clearCart`.
