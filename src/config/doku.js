// src/config/doku.js

export const DOKU_CONFIG = {
  // DAPATKAN DARI DASHBOARD DOKU (Menu Configuration -> Integration)
  CLIENT_ID: 'BRN-0279-1775231836431', 
  SECRET_KEY: 'SK-YVCEmWJhSUcye9rdRCMI',
  
  // URL Sandbox untuk Pengetesan (Ganti ke Production jika sudah Live)
  BASE_URL: 'https://api-sandbox.doku.com',
  
  // Merchant ID Anda
  MALL_ID: 'YOUR_MALL_ID_HERE',
  
  // URL untuk Redirect setelah pembayaran selesai
  NOTIFY_URL: 'https://your-supabase-function-url.com/doku-notify',
};
