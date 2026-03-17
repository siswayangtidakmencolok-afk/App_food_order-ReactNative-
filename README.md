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

Aplikasi pemesanan makanan berbasis **React Native + Expo** yang memungkinkan pelanggan menelusuri menu, menambahkan item ke keranjang, melakukan pembayaran, dan melacak riwayat pesanan — langsung dari smartphone dengan antarmuka yang simpel dan intuitif.

---

## ✨ Fitur

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| 🎬 **Splash Screen** | Layar pembuka saat aplikasi pertama dijalankan | ✅ Tersedia |
| 🚀 **Onboarding** | Panduan singkat untuk pengguna baru dengan animasi | ✅ Tersedia |
| 🏠 **Home** | Tampilan utama dengan menu unggulan dan rekomendasi | ✅ Tersedia |
| 🍽️ **Menu & Detail** | Daftar lengkap makanan beserta halaman detail per item | ✅ Tersedia |
| 🛒 **Keranjang** | Kelola item pesanan sebelum checkout | ✅ Tersedia |
| 💳 **Pembayaran** | Proses pembayaran pesanan | ✅ Tersedia |
| 🧾 **Invoice** | Struk/bukti transaksi setelah pesanan berhasil | ✅ Tersedia |
| 📋 **Riwayat Pesanan** | Melihat daftar pesanan yang pernah dilakukan | ✅ Tersedia |
| 👤 **Profil** | Manajemen data profil pengguna | ✅ Tersedia |
| 🗂️ **Panel Admin** | Manajemen menu dan pesanan | 🚧 Coming Soon |

---

## 🛠️ Teknologi yang Digunakan

- **[React Native](https://reactnative.dev/)** — Framework utama pengembangan aplikasi mobile
- **[Expo](https://expo.dev/)** — Toolchain & framework untuk mempercepat development
- **JavaScript** — Bahasa pemrograman utama
- **Lottie** — Animasi berbasis JSON (`assets/lottie`)
- **Context API** — State management global aplikasi

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
git clone https://github.com/username/AplikasiPemesananMakanan.git

# 2. Masuk ke direktori proyek
cd AplikasiPemesananMakanan

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
AplikasiPemesananMakanan/
├── scripts/
│   └── reset-project.js        # Script reset proyek
├── src/
│   ├── assets/
│   │   └── lottie/
│   │       └── success.json    # Animasi Lottie sukses
│   ├── components/
│   │   ├── CartItem.js         # Komponen item keranjang
│   │   ├── FoodCard.js         # Komponen kartu makanan
│   │   ├── OnboardingAnimation.js
│   │   ├── OnboardingAnimation.native.js
│   │   └── SuccessAnimation.js # Animasi order berhasil
│   ├── config/
│   │   └── theme.js            # Konfigurasi warna & tema
│   ├── context/
│   │   └── AppContext.js       # Global state management
│   ├── data/
│   │   └── menuData.js         # Data menu makanan
│   └── screens/
│       ├── SplashScreen.js
│       ├── OnboardingScreen.js
│       ├── HomeScreen.js
│       ├── MenuScreen.js
│       ├── MenuDetailScreen.js
│       ├── CartScreen.js
│       ├── PaymentScreen.js
│       ├── InvoiceScreen.js
│       ├── OrderHistoryScreen.js
│       └── ProfileScreen.js
├── App.js                      # Entry point aplikasi
├── .gitignore
└── package.json
```

---

## 🗺️ Roadmap

- [x] Splash Screen & Onboarding
- [x] Halaman Home
- [x] Halaman Menu & Detail Menu
- [x] Keranjang Belanja
- [x] Proses Pembayaran
- [x] Invoice / Struk Pesanan
- [x] Riwayat Pesanan
- [x] Halaman Profil
- [ ] Panel Admin
- [ ] Integrasi Backend & Database
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
