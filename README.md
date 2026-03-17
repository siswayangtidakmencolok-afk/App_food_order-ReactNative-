<div align="center">

# 🍽️ Aplikasi Pemesanan Makanan

**Aplikasi mobile pemesanan makanan yang praktis dan mudah digunakan**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue?style=flat-square)](https://expo.dev/)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

</div>

---

## 📖 Tentang Aplikasi

Aplikasi pemesanan makanan berbasis **React Native + Expo** yang memungkinkan pelanggan menelusuri menu, menambahkan item ke keranjang, dan melakukan pemesanan langsung dari smartphone dengan antarmuka yang simpel dan intuitif.

---

## ✨ Fitur

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| 🏠 **Home** | Tampilan utama dengan menu unggulan dan rekomendasi | ✅ Tersedia |
| 🍽️ **Menu** | Daftar lengkap makanan beserta detail dan harga | ✅ Tersedia |
| 🛒 **Keranjang** | Kelola item pesanan sebelum checkout | ✅ Tersedia |
| 👤 **Akun** | Manajemen profil dan riwayat pesanan | ✅ Tersedia |
| 🔐 **Login / Register** | Autentikasi pengguna | ✅ Tersedia |
| 🗂️ **Panel Admin** | Manajemen menu dan pesanan | 🚧 Coming Soon |

---

## 🛠️ Teknologi yang Digunakan

- **[React Native](https://reactnative.dev/)** — Framework utama pengembangan aplikasi mobile
- **[Expo](https://expo.dev/)** — Toolchain & framework untuk mempercepat development
- **JavaScript** — Bahasa pemrograman utama

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

Pastikan sudah terinstal:
- [Node.js](https://nodejs.org/) versi 16 ke atas
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Aplikasi **Expo Go** di smartphone (Android/iOS)

### Instalasi

```bash
# 1. Clone repository ini
git clone https://github.com/siswayangtidakmencolok-afk/App_food_order-ReactNative-.git

# 2. Masuk ke direktori proyek
cd app-pemesanan-makanan

# 3. Install dependencies
npm install

# 4. Jalankan aplikasi
npx expo start
```

### Menjalankan di Device

Setelah `npx expo start` berjalan:
- **Android/iOS** → Scan QR code menggunakan aplikasi **Expo Go**
- **Android Emulator** → Tekan `a` di terminal
- **iOS Simulator** → Tekan `i` di terminal

---

## 📁 Struktur Proyek

```
app-pemesanan-makanan/
├── assets/             # Gambar, ikon, dan font
├── components/         # Komponen UI yang dapat digunakan ulang
├── screens/            # Halaman-halaman aplikasi
│   ├── HomeScreen.js
│   ├── MenuScreen.js
│   ├── CartScreen.js
│   └── AccountScreen.js
├── navigation/         # Konfigurasi navigasi
├── App.js              # Entry point aplikasi
└── package.json
```

> ⚠️ Sesuaikan struktur folder di atas dengan struktur aktual proyek kamu.

---

## 🗺️ Roadmap

- [x] Halaman Home
- [x] Halaman Menu
- [x] Keranjang Belanja
- [x] Halaman Akun
- [ ] Panel Admin
- [ ] Integrasi Payment Gateway
- [ ] Push Notification
- [ ] Dark Mode

---

## 🤝 Kontribusi

Kontribusi sangat terbuka! Berikut caranya:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan (`git commit -m 'Tambah fitur X'`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT** — lihat file [LICENSE](LICENSE) untuk detail lengkap.

---

<div align="center">

Dibuat dengan ❤️ menggunakan React Native & Expo

</div>
