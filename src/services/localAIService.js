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
    "Halo Sobat Kuliner! Saya Chef, asisten pribadi kamu. Lagi ngidam apa hari ini? 👨‍🍳",
    "Hai! Wah, kayaknya ada yang lagi lapar nih. Mau saran menu yang bikin kenyang? 😋",
    "Halo! Saya siap bantu kamu nemuin makanan paling top di sini. Ada spesifikasi khusus?"
  ],
  recommendations: [
    "Kalau bingung, Nasi Goreng Spesial kita lagi viral banget lho! Gurihnya gak main-main. Mau coba? 🍛",
    "Saya super nyaranin Mie Ayam Jamur. Jamurnya fresh banget dan bumbunya nendang! Yakin gak mau? 🍜",
    "Jujur, Kopi Susu Gula Aren kita itu best-seller banget untuk nongkrong. Coba dulu deh! ☕"
  ],
  pricing: [
    "Tenang saja, harga di FoodsStreets bersahabat kok! Mulai dari 5 ribuan sampai 25 ribu aja. Murah meriah! 💸",
    "Harganya sangat pas di kantong pelajar maupun pekerja. Kualitas bintang lima, harga kaki lima! ⭐"
  ],
  delivery: [
    "Pengiriman kita jamin kilat! Kurir sudah siap sedia bawa makanan kamu selagi masih hangat. 🛵💨",
    "Gak perlu nunggu lama, orderan kamu langsung diproses dan meluncur ke depan pintu! Wusss~ 🚀"
  ],
  app_info: [
    "FoodsStreets ini desainnya dibikin khusus buat kamu pecinta kuliner premium. Geser ke menu, banyak pilihannya lho! 🌟",
    "Di sini semua transaksi aman dan cepat. Jangan lupa cek promo gratis ongkirnya! 🎁"
  ],
  fallback: [
    "Hmm, jujur saya kurang paham bagian itu. Tapi kalau bahas rasa makanan, saya ahlinya! Gimana kalau kita bahas menu best-seller aja? 🍔",
    "Itu pertanyaan di luar kebiasaan saya masak di dapur nih. 😅 Ada pertanyaan seputar cara pemesanan atau saran menu?"
  ]
};

export const sendMessageToLocalAI = (message) => {
  const msg = message.toLowerCase();

  // Logic Pencocokan Sederhana namun Cerdas
  if (msg.includes('halo') || msg.includes('hai') || msg.includes('pagi') || msg.includes('siang') || msg.includes('bro') || msg.includes('chef')) {
    return RESPONSES.greetings[Math.floor(Math.random() * RESPONSES.greetings.length)];
  }

  if (msg.includes('rekomendasi') || msg.includes('saran') || msg.includes('enak') || msg.includes('makan') || msg.includes('menu') || msg.includes('pesen')) {
    return RESPONSES.recommendations[Math.floor(Math.random() * RESPONSES.recommendations.length)];
  }

  if (msg.includes('harga') || msg.includes('mahal') || msg.includes('murah') || msg.includes('duit') || msg.includes('bayar')) {
    return RESPONSES.pricing[Math.floor(Math.random() * RESPONSES.pricing.length)];
  }

  if (msg.includes('kirim') || msg.includes('kurir') || msg.includes('lama') || msg.includes('ongkir') || msg.includes('antar')) {
    return RESPONSES.delivery[Math.floor(Math.random() * RESPONSES.delivery.length)];
  }

  if (msg.includes('aplikasi') || msg.includes('apa ini') || msg.includes('fitur') || msg.includes('bantuan')) {
    return RESPONSES.app_info[Math.floor(Math.random() * RESPONSES.app_info.length)];
  }

  return RESPONSES.fallback[Math.floor(Math.random() * RESPONSES.fallback.length)];
};
