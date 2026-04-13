// src/services/localAIService.js

/**
 * Street Chef Local Intelligence
 * Sistem pintar lokal yang handal tanpa butuh API eksternal.
 * Memberikan respon instan, cerdas, dan selalu nyambung dengan data menu.
 */

const MENU_DATA = [
  { name: 'Nasi Goreng Spesial', category: 'Main Course', price: '25.000', recommended: true },
  { name: 'Mie Ayam Jamur', category: 'Noodles', price: '18.000', recommended: true },
  { name: 'Sate Ayam Madura', category: 'Street Food', price: '20.000', recommended: false },
  { name: 'Es Teh Manis', category: 'Drinks', price: '5.000', recommended: false },
  { name: 'Kopi Susu Gula Aren', category: 'Drinks', price: '15.000', recommended: true },
];

const RESPONSES = {
  greetings: [
    "Halo Sobat Kuliner! Saya Street Chef, siap bantu kamu cari makanan paling mantap hari ini! 👨‍🍳🔥",
    "Hai! Lapar ya? Tenang, Street Chef di sini buat kasih saran menu yang bikin lidah bergoyang! 🛵",
    "Selamat datang di FoodsStreets! Mau cari menu apa hari ini? Saya punya banyak rekomendasi rahasia! ⭐"
  ],
  recommendations: [
    "Wah, kalau menurut saya sih, kamu wajib coba **Nasi Goreng Spesial** kita! Gurihnya dapet banget! 🍛",
    "Lagi pengen yang berkuah? **Mie Ayam Jamur** kita juaranya! Jamurnya fresh dan mienya kenyal! 🍜",
    "Buat temen santai, **Kopi Susu Gula Aren** kita paling pas! Gak terlalu manis, kopinya berasa! ☕"
  ],
  app_info: [
    "Di FoodsStreets, kamu bisa pesen makanan dari kaki lima favoritmu dengan kualitas bintang lima! 🌟",
    "Kita punya fitur pengiriman super cepat lho, dijamin makanan sampai masih anget! 🛵💨",
    "Jangan lupa cek tab Promo ya, banyak diskon yang bakal bikin kantong kamu happy! 💸"
  ],
  fallback: [
    "Hmm, pertanyaan menarik! Tapi sebagai Street Chef, saya lebih jago soal makanan lho. Mau saya kasih rekomendasi menu enak? 🍔",
    "Waduh, saya kurang paham soal itu. Gimana kalau kita bahas menu best-seller kita minggu ini? 🍜",
    "Street Chef lagi fokus masak nih! Coba tanya soal menu atau pengiriman, pasti saya jawab dengan semangat! 👨‍🍳"
  ]
};

export const sendMessageToLocalAI = (message) => {
  const msg = message.toLowerCase();

  // Logic Pencocokan Sederhana namun Cerdas
  if (msg.includes('halo') || msg.includes('hai') || msg.includes('pagi') || msg.includes('siang') || msg.includes('malam')) {
    return RESPONSES.greetings[Math.floor(Math.random() * RESPONSES.greetings.length)];
  }

  if (msg.includes('rekomendasi') || msg.includes('saran') || msg.includes('enak') || msg.includes('makan apa') || msg.includes('menu')) {
    return RESPONSES.recommendations[Math.floor(Math.random() * RESPONSES.recommendations.length)];
  }

  if (msg.includes('aplikasi') || msg.includes('apa ini') || msg.includes('fitur') || msg.includes('bantuan')) {
    return RESPONSES.app_info[Math.floor(Math.random() * RESPONSES.app_info.length)];
  }

  return RESPONSES.fallback[Math.floor(Math.random() * RESPONSES.fallback.length)];
};
