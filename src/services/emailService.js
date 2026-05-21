// src/services/emailService.js

// Konfigurasi EmailJS (Nanti diganti dengan milik Anda)
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || 'service_s9g0jjv',
  TEMPLATE_ID: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_xhj10ongit',
  PUBLIC_KEY: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || 'yNaj9oa1bpEoIZHH1',
};

/**
 * Mengirimkan Struk / Invoice Pembelian ke Email User
 * @param {Object} orderData Data pesanan lengkap
 * @param {String} userEmail Alamat email tujuan
 */
export const sendOrderReceiptEmail = async (orderData, userEmail) => {
  try {
    // 1. Ubah susunan item makanan menjadi teks rapi (contoh: "2x Nasi Goreng (Rp 50.000)")
    const itemsListText = orderData.items
      .map(item => `${item.quantity}x ${item.name} (Rp ${(item.price * item.quantity).toLocaleString('id-ID')})`)
      .join('\\n');

    // 2. Bungkus parameter yang akan dikirim ke template EmailJS
    const templateParams = {
      to_email: userEmail,                     // Alamat email pelanggan
      customer_name: orderData.customerName,   // Nama pelanggan
      order_number: orderData.orderNumber,     // Nomor Pesanan (Foods-xxxx)
      items_list: itemsListText,               // Daftar makanan
      total_price: `Rp ${orderData.total.toLocaleString('id-ID')}`, // Total bayar
      delivery_address: orderData.deliveryAddress, // Alamat pengiriman
    };

    // 3. Tembakkan ke Server EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      console.log('✅ Email Struk berhasil diluncurkan ke:', userEmail);
      return true;
    } else {
      const errorText = await response.text();
      console.warn('⚠️ Gagal mengirim email:', errorText);
      return false;
    }
  } catch (error) {
    console.error('🚨 Error koneksi EmailJS:', error);
    return false;
  }
};
