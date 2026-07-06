// src/services/geminiService.js
// Model: gemini-2.0-flash — lebih cepat, lebih cerdas, konteks panjang

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * System Instruction — Karakter "Street Chef"
 * Dirancang untuk jawaban yang spesifik, nyambung, dan kontekstual
 */
const SYSTEM_INSTRUCTION = `
Kamu adalah "Street Chef" 👨‍🍳 — asisten AI kuliner cerdas di aplikasi FoodsStreets.

=== KEPRIBADIAN ===
- Gaul, hangat, dan to-the-point. Hindari basa-basi berlebihan.
- Panggil user dengan nama mereka jika tersedia di konteks, atau "Sobat Kuliner".
- Pakai emoji makanan secukupnya — jangan berlebihan, 1-2 per balasan sudah cukup.
- Bahasa Indonesia natural dan luwes, bukan formal kaku.

=== CARA MENJAWAB ===
- SELALU baca konteks menu, keranjang, dan profil user yang diberikan SEBELUM menjawab.
- Jika user tanya "ada apa?" atau "rekomendasiin dong" — sebutkan spesifik nama menu dari daftar yang tersedia, bukan generik.
- Jika user menyebut makanan yang ADA di daftar menu → langsung rekomendasikan dengan harga dan kategorinya.
- Jika user menyebut makanan yang TIDAK ada → jujur bilang belum tersedia, tawarkan alternatif dari menu yang ada.
- Jika keranjang user sudah ada item → akui itu dan beri saran pelengkap yang relevan.
- Jawaban singkat dan padat untuk pertanyaan singkat. Jawaban detail untuk pertanyaan detail.
- Jangan ulangi greeting "Halo" di setiap balasan — hanya di pesan pertama saja.

=== TINDAKAN KHUSUS ===
- Jika user minta tambahkan ke keranjang, pesan, atau beli sesuatu → sertakan tag tersembunyi di AKHIR balasan: [ACTION: ADD_TO_CART: Nama Menu Persis Sesuai Daftar]
- Nama menu harus PERSIS sama dengan yang ada di daftar — huruf besar/kecil diabaikan tapi ejaan harus tepat.
- Satu balasan maksimal SATU tag ADD_TO_CART — pilihkan yang paling relevan.

=== BATASAN ===
- Jika ditanya hal di luar kuliner/aplikasi → jawab singkat dan arahkan kembali ke topik makanan.
- Jangan buat harga atau info menu karangan — hanya gunakan data dari konteks yang diberikan.
- Jangan sebut merek kompetitor.
`;

/**
 * Kirim pesan ke Gemini dengan konteks lengkap aplikasi
 * @param {string} userMessage - Pesan dari user
 * @param {Array} chatHistory - Riwayat chat [{role, text}]
 * @param {string} appContextData - Konteks dinamis: menu, keranjang, profil
 * @returns {Promise<string>} - Balasan dari AI
 */
export const sendMessageToGemini = async (userMessage, chatHistory = [], appContextData = '') => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('EXPO_PUBLIC_GEMINI_API_KEY belum diset di .env');
    }

    // Ambil 12 pesan terakhir untuk konteks yang lebih panjang
    const recentHistory = chatHistory.slice(-12);

    // Filter: pastikan history bergantian user-model dengan benar
    // Gemini butuh urutan yang valid (user lalu model, dst)
    const validHistory = [];
    let lastRole = null;
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'user' : 'model';
      // Skip duplikat peran yang sama berturutan
      if (role === lastRole) continue;
      validHistory.push({ role, parts: [{ text: msg.text || '' }] });
      lastRole = role;
    }

    // Pastikan history tidak dimulai dari 'model'
    if (validHistory.length > 0 && validHistory[0].role === 'model') {
      validHistory.shift();
    }

    const systemWithContext = appContextData
      ? `${SYSTEM_INSTRUCTION}\n\n=== KONTEKS REAL-TIME SAAT INI ===\n${appContextData}`
      : SYSTEM_INSTRUCTION;

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemWithContext }],
      },
      contents: [
        ...validHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.75,        // Sedikit kreatif tapi tetap akurat
        topK: 40,
        topP: 0.92,
        maxOutputTokens: 512,     // Cukup untuk jawaban detail tanpa bertele-tele
        candidateCount: 1,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Gemini HTTP Error]', response.status, errText);
      // Fallback ke model lama jika 2.0-flash tidak tersedia
      if (response.status === 404 || response.status === 400) {
        return sendMessageToGeminiLegacy(userMessage, chatHistory, appContextData);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    // Handle safety block
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return 'Maaf, pertanyaan itu tidak bisa saya jawab. Coba tanya tentang menu atau makanan ya! 🍽️';
    }

    const errMsg = data.error?.message || 'Response tidak valid';
    console.error('[Gemini Error]', data);
    return `Hmm, ada gangguan teknis sebentar. Coba lagi ya! 🛵`;

  } catch (error) {
    console.error('[Gemini Service Error]', error);
    return `Koneksi ke dapur AI terputus sebentar. Coba lagi! 👨‍🍳`;
  }
};

/**
 * Fallback ke model 1.5-flash jika 2.0-flash tidak tersedia
 */
const sendMessageToGeminiLegacy = async (userMessage, chatHistory, appContextData) => {
  const LEGACY_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const recentHistory = chatHistory.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || '' }],
  }));

  try {
    const res = await fetch(LEGACY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n${appContextData}` }],
        },
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: { temperature: 0.75, maxOutputTokens: 512 },
      }),
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak bisa menjawab saat ini. 🍽️';
  } catch {
    return 'Koneksi ke dapur AI terputus. Coba lagi! 👨‍🍳';
  }
};
