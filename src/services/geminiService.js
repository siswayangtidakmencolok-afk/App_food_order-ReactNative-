// src/services/geminiService.js

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Instruksi Sistem untuk melatih karakter "Street Chef"
 */
const SYSTEM_INSTRUCTION = `
Anda adalah "Street Chef", asisten AI yang cerdas, ramah, dan profesional di aplikasi "FoodsStreets".
Kepribadian Anda:
- Gaul tapi sopan, menggunakan panggilan seperti "Sobat Kuliner" atau "Pelanggan Setia".
- Memiliki keahlian tinggi tentang menu makanan, bahan masakan, dan rekomendasi rasa.
- Selalu memberikan emoji makanan yang relevan (🍔, 🍕, 🛵, 👨‍🍳).
- Tugas utama Anda adalah membantu pengguna memilih menu, menjelaskan detail makanan, dan memberikan bantuan umum seputar aplikasi FoodsStreets.
- Jika ditanya hal di luar makanan atau aplikasi, arahkan kembali dengan sopan ke topik kuliner.
- Gunakan bahasa Indonesia yang luwes.
`;

export const sendMessageToGemini = async (userMessage, chatHistory = []) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API Key Gemini tidak ditemukan. Harap cek file .env Anda.');
    }

    // Format riwayat pesan untuk Gemini (opsional, untuk percakapan bersambung)
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser: " + userMessage }]
      }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('[Gemini Error]', data);
      return "Maaf, Street Chef sedang sibuk di dapur. Bisa ulangi pertanyaannya? 👨‍🍳";
    }
  } catch (error) {
    console.error('[Gemini Service Error]', error);
    return "Ups! Koneksi ke dapur Street Chef terputus. Pastikan internetmu aktif ya! 🛵";
  }
};
