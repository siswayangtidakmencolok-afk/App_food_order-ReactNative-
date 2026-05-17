// src/services/midtransService.js
import { MIDTRANS_CONFIG } from '../config/midtrans';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

/**
 * Membuat Transaksi Baru di Midtrans Snap
 * @param {Object} orderData data dari keranjang/checkout
 */
export const createMidtransTransaction = async (orderData) => {
  try {
    const serverKey = MIDTRANS_CONFIG.SERVER_KEY;
    const authHeader = `Basic ${CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(serverKey + ':'))}`;

    // Gunakan CORS Proxy yang mendukung POST dan Authorization Header (corsproxy.io)
    const url = Platform.OS === 'web' 
      ? `https://corsproxy.io/?${encodeURIComponent(MIDTRANS_CONFIG.BASE_URL)}`
      : MIDTRANS_CONFIG.BASE_URL;

    // 1. Siapkan Body Request sesuai spek Midtrans Snap
    const body = {
      transaction_details: {
        order_id: `FOODS-${orderData.orderNumber || Date.now()}`,
        gross_amount: Math.floor(Number(orderData.total))
      },
      item_details: orderData.items.map(item => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        price: Math.floor(Number(item.price)),
        quantity: item.quantity,
        name: item.name.substring(0, 50)
      })),
      customer_details: {
        first_name: orderData.customerName || 'Pelanggan',
        email: orderData.customerEmail || 'customer@example.com'
      },
      credit_card: {
        secure: true
      },
      // Opsional: Batasi metode pembayaran
      // enabled_payments: ["credit_card", "gopay", "shopeepay", "other_qris", "bank_transfer"]
    };

    // 2. Kirim Request ke Midtrans API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok && data.token && data.redirect_url) {
      console.log('[Midtrans] Transaction Created:', data.token);
      return {
        success: true,
        token: data.token,
        redirect_url: data.redirect_url, // URL untuk WebView
        order_id: body.transaction_details.order_id
      };
    } else {
      console.error('[Midtrans] API Error:', data);
      return { 
        success: false, 
        error: data.error_messages ? data.error_messages[0] : 'Gagal membuat transaksi Midtrans' 
      };
    }

  } catch (error) {
    console.error('[Midtrans] Service Error:', error);
    return { success: false, error: error.message };
  }
};
