// src/services/dokuService.js
import CryptoJS from 'crypto-js';
import { DOKU_CONFIG } from '../config/doku';
import { v4 as uuidv4 } from 'uuid'; // Jika tidak ada, pakai Math.random()

/**
 * Membuat Transaksi Baru di DOKU Checkout
 * @param {Object} orderData data dari keranjang/checkout
 */
export const createDokuTransaction = async (orderData) => {
  try {
    const requestId = `REQ-${Date.now()}`;
    const timestamp = new Date().toISOString().substring(0, 19) + 'Z';
    const targetPath = '/checkout/v1/payment';
    
    // 1. Siapkan Body Request
    const body = {
      order: {
        invoice_number: `INV-${orderData.orderNumber || Date.now()}`,
        amount: orderData.total,
        callback_url: 'https://foods-streets.vercel.app/payment-finish', // Ganti ke URL Anda
        line_items: orderData.items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      },
      payment: {
        payment_due_date: 60 // menit
      },
      customer: {
        id: orderData.userId || 'GUEST',
        name: orderData.customerName || 'Pelanggan FoodStreets',
        email: orderData.customerEmail || 'test@example.com'
      }
    };

    // 2. Hitung Digest (SHA256 dari Body)
    const bodyString = JSON.stringify(body);
    const digest = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(bodyString));

    // 3. Hitung Signature (HMAC-SHA256 dari Header + Digest)
    const signaturePayload = 
      `Client-Id:${DOKU_CONFIG.CLIENT_ID}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${timestamp}\n` +
      `Request-Target:${targetPath}\n` +
      `Digest:${digest}`;
    
    const signature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(signaturePayload, DOKU_CONFIG.SECRET_KEY)
    );

    // 4. Kirim Request ke DOKU
    console.log('[DOKU] Sending Request to:', DOKU_CONFIG.BASE_URL + targetPath);
    
    const response = await fetch(DOKU_CONFIG.BASE_URL + targetPath, {
      method: 'POST',
      headers: {
        'Client-Id': DOKU_CONFIG.CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': `HMACSHA256=${signature}`,
        'Content-Type': 'application/json'
      },
      body: bodyString
    });

    const data = await response.json();
    
    if (data.response && data.response.payment && data.response.payment.url) {
      return {
        success: true,
        checkout_url: data.response.payment.url,
        invoice_number: body.order.invoice_number
      };
    } else {
      console.error('[DOKU] Response Error:', data);
      throw new Error(data.message || 'Gagal membuat transaksi DOKU');
    }

  } catch (error) {
    console.error('[DOKU] Transaction Error:', error);
    return { success: false, error: error.message };
  }
};
