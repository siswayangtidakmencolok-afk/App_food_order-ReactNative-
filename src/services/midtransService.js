// src/services/midtransService.js
import { supabase } from '../config/supabase';

/**
 * Buat transaksi Snap via Supabase Edge Function (SERVER_KEY aman di server).
 * Fallback: set EXPO_PUBLIC_MIDTRANS_USE_DIRECT=true untuk dev tanpa deploy function.
 */
export const createMidtransTransaction = async (orderData) => {
  try {
    const useDirect = process.env.EXPO_PUBLIC_MIDTRANS_USE_DIRECT === 'true';

<<<<<<< HEAD
    if (!useDirect) {
      const { data, error } = await supabase.functions.invoke('create-midtrans-snap', {
        body: {
          orderId:       orderData.orderId,
          orderNumber:   orderData.orderNumber || String(Date.now()),
          total:         orderData.total,
          items:         orderData.items,
          customerName:  orderData.customerName,
          customerEmail: orderData.customerEmail,
        },
      });
=======
    // Gunakan CORS Proxy yang mendukung POST dan Authorization Header (corsproxy.io)
    const url = Platform.OS === 'web' 
      ? `https://corsproxy.io/?${encodeURIComponent(MIDTRANS_CONFIG.BASE_URL)}`
      : MIDTRANS_CONFIG.BASE_URL;
>>>>>>> main

      if (error) {
        console.error('[Midtrans] Edge function error:', error);
        return { success: false, error: error.message || 'Gagal memanggil create-midtrans-snap' };
      }

      if (data?.success && data.redirect_url) {
        return {
          success: true,
          token: data.token,
          redirect_url: data.redirect_url,
          order_id: data.order_id,
        };
      }

      return {
        success: false,
        error: data?.error || 'Gagal membuat transaksi Midtrans',
      };
    }

    return createMidtransTransactionDirect(orderData);
  } catch (error) {
    console.error('[Midtrans] Service Error:', error);
    return { success: false, error: error.message };
  }
};

/** Dev fallback — jangan dipakai production (SERVER_KEY di client) */
async function createMidtransTransactionDirect(orderData) {
  const { MIDTRANS_CONFIG } = await import('../config/midtrans');
  const CryptoJS = (await import('crypto-js')).default;
  const { Platform } = await import('react-native');

  const serverKey = MIDTRANS_CONFIG.SERVER_KEY;
  if (!serverKey) {
    return { success: false, error: 'MIDTRANS_SERVER_KEY tidak ditemukan di .env' };
  }

  const authHeader = `Basic ${CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(serverKey + ':'))}`;
  const url = Platform.OS === 'web'
    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(MIDTRANS_CONFIG.BASE_URL)}`
    : MIDTRANS_CONFIG.BASE_URL;

  const midtransOrderId = `FOODS-${orderData.orderNumber || Date.now()}`;
  const body = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: Math.floor(Number(orderData.total)),
    },
    item_details: orderData.items.map((item) => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      price: Math.floor(Number(item.price)),
      quantity: item.quantity,
      name: item.name.substring(0, 50),
    })),
    customer_details: {
      first_name: orderData.customerName || 'Pelanggan',
      email: orderData.customerEmail || 'customer@example.com',
    },
    credit_card: { secure: true },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (response.ok && data.token && data.redirect_url) {
    if (orderData.orderId) {
      await supabase
        .from('orders')
        .update({ midtrans_order_id: midtransOrderId })
        .eq('id', orderData.orderId);
    }
    return {
      success: true,
      token: data.token,
      redirect_url: data.redirect_url,
      order_id: midtransOrderId,
    };
  }

  return {
    success: false,
    error: data.error_messages ? data.error_messages[0] : 'Gagal membuat transaksi Midtrans',
  };
}
