// src/services/midtransService.js
/**
 * Layanan Simulasi Midtrans - Membantu menangani logika pembayaran
 * yang meniru alur SNAP Sandbox.
 */

// Placeholder untuk Client Key Anda nanti
export const MIDTRANS_CLIENT_KEY = 'SB-Mid-client-XXXXXXXXXXXX'; 

/**
 * Mensimulasikan permintaan pembuatan Snap Token.
 * Nantinya fungsi ini akan memanggil backend Anda (misal: Laravel/NodeJS)
 * yang kemudian diteruskan ke API Midtrans.
 */
export const createSnapTransaction = async (orderData) => {
  console.log('Simulating Midtrans Transaction for Order:', orderData.orderNumber);
  
  // Simulasi delay network
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mengembalikan Toko "Dummy" yang merepresentasikan Snap Token
  return {
    snapToken: `token-${Math.random().toString(36).substr(2, 9)}`,
    redirectUrl: '#', // Di real App, ini arahkan ke WebView
  };
};

/**
 * Ikon Bank untuk UI Midtrans
 */
export const BANK_ICONS = {
  bca: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/1200px-Bank_Central_Asia.svg.png',
  mandiri: 'https://upload.wikimedia.org/wikipedia/id/thumb/a/ad/Bank_Mandiri_logo_2016.svg/1200px-Bank_Mandiri_logo_2016.svg.png',
  bni: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/51/Bank_Negara_Indonesia_logo.svg/1200px-Bank_Negara_Indonesia_logo.svg.png',
  bri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/1200px-BANK_BRI_logo.svg.png',
  qris: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png',
};
