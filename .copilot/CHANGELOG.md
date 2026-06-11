# 📅 Changelog & Status Project

## ✅ Fitur yang Sudah Berjalan (Selesai/Stabil)
1. **Autentikasi (Supabase)**: Login & Register dengan Email/Password. Verifikasi Email.
2. **Google OAuth**: Integrasi UI dan logika web dengan `signInWithOAuth`.
3. **Profil User (ProfileScreen)**: UI Bento Grid, Animasi Background (`GrainientBackground`), Slider Sosial Media (`LogoLoop`).
4. **Riwayat Pesanan (OrderHistoryScreen)**: Filter Tab "Pill", Modal Detail interaktif.
5. **Keranjang (CartScreen)**: Redesign modern.
6. **Pelacakan (DeliveryTrackerScreen)**: UI Map + *Bottom Sheet* dengan tombol ekspansi gaya Gojek/Grab.

## 🚧 Sedang Dalam Pengembangan (WIP)
1. Integrasi Apple OAuth di AuthScreen (saat ini masih *mockup*).
2. Fitur "Pemberitahuan/Notifikasi" (Saat ini menampilkan *Alert* "segera hadir").
3. Integrasi *Payment Gateway* Midtrans (Kredensial ada di `.env` namun mungkin belum disempurnakan di UI Cart).

## 📋 TODO List Terdekat
- [ ] Menyelesaikan setup Google Cloud Console & Supabase Dashboard untuk Google OAuth (sedang dikerjakan user).
- [ ] Mengaktifkan fitur Notifikasi.
- [ ] Tes menyeluruh integrasi Midtrans untuk pembayaran pesanan.
