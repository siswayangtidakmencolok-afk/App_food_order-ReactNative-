// src/services/whatsappService.js

const FONNTE_TOKEN = '7M6tiKM5jw2gcZDnkDxi'; // Token di-hardcode agar langsung jalan di Vercel/Cloudflare

/**
 * Mengirimkan Struk / Notifikasi Pesanan ke WhatsApp Pelanggan via Fonnte
 * @param {Object} orderData Data pesanan lengkap
 * @param {String} phoneNumber Nomor HP tujuan (format bebas, misal 0812... atau 62812...)
 */
export const sendWhatsAppReceipt = async (orderData, phoneNumber) => {
  if (!FONNTE_TOKEN || FONNTE_TOKEN.includes('TOKEN_ANDA_DISINI')) {
    console.warn('⚠️ Token Fonnte belum dipasang di .env. Pesan WA dibatalkan.');
    return false;
  }

  // 1. Bersihkan nomor telepon (Fonnte bisa menerima 08... atau 628..., tapi mari kita pastikan formatnya standar)
  let targetNumber = phoneNumber.replace(/\\D/g, ''); // Hapus karakter selain angka
  if (targetNumber.startsWith('0')) {
    targetNumber = '62' + targetNumber.substring(1);
  }

  // 2. Ubah susunan item makanan menjadi teks rapi
  const itemsListText = orderData.items
    .map(item => `- ${item.quantity}x ${item.name} (Rp ${(item.price * item.quantity).toLocaleString('id-ID')})`)
    .join('\\n');

  // 3. Rancang isi pesan WhatsApp (Pesan teks biasa dengan emoji)
  const waMessage = `*FOODSSTREETS - STRUK PESANAN* 🍔\\n\\n` +
    `Halo *${orderData.customerName}*, pesanan Anda berhasil kami terima dan sedang diproses!\\n\\n` +
    `*Nomor Pesanan:* ${orderData.orderNumber}\\n` +
    `*Alamat Pengiriman:* ${orderData.deliveryAddress}\\n\\n` +
    `*Rincian Pesanan:*\\n${itemsListText}\\n\\n` +
    `*Total Tagihan: Rp ${orderData.total.toLocaleString('id-ID')}*\\n\\n` +
    `Terima kasih telah jajan di FoodsStreets! Pesanan Anda akan segera diantar oleh kurir kami. 🛵💨`;

  try {
    // 4. Kirim *Request* ke Fonnte
    const formData = new FormData();
    formData.append('target', targetNumber);
    formData.append('message', waMessage);
    // Anda bisa mengizinkan banyak nomor dengan memisahkan koma jika perlu

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.status === true) {
      console.log('✅ Pesan WhatsApp berhasil diluncurkan ke:', targetNumber);
      return true;
    } else {
      console.warn('⚠️ Gagal mengirim WA via Fonnte:', result.reason || result.detail);
      return false;
    }
  } catch (error) {
    console.error('🚨 Error koneksi Fonnte WA:', error);
    return false;
  }
};
