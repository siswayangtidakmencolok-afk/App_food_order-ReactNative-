// src/services/eWallet.js

/**
 * Simulasi API Pembayaran E-Wallet (OVO, GoPay, DANA)
 * 
 * @param {string} provider - Pilihan 'ovo', 'gopay', 'dana', atau 'shopeepay'
 * @param {number} amount - Total bayar
 * @param {string} orderId - ID Pesanan
 * @param {string} pin - PIN 6-digit (Opsional untuk simulasi)
 */
export const processEWalletPayment = async (provider, amount, orderId, pin) => {
  return new Promise((resolve, reject) => {
    console.log(`[E-Wallet API] Processing ${provider} for Order ${orderId}...`);

    // Simulasi delay jaringan API (2 - 3 detik)
    const delay = 2000 + Math.random() * 1000;

    setTimeout(() => {
      // 95% Chance of Success untuk simulasi tugas
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        resolve({
          status: 'success',
          transactionId: `TXN-${provider.toUpperCase()}-${orderId.split('ORD')[1] || Date.now()}`,
          message: `Pembayaran Rp ${amount.toLocaleString('id-ID')} via ${provider.toUpperCase()} Berhasil!`,
          provider: provider,
          timestamp: new Date().toISOString()
        });
      } else {
        reject({
          status: 'failed',
          message: `Koneksi ke ${provider.toUpperCase()} terputus. Silakan coba lagi atau gunakan metode lain.`
        });
      }
    }, delay);
  });
};

