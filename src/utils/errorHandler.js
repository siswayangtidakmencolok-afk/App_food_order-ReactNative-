// src/utils/errorHandler.js
/**
 * Global error handler untuk menangkap error dan promise rejection yang tidak ditangkap
 * Dengan penyaringan spesifik untuk menyembunyikan error WebSocket Supabase Realtime yang tidak relevan
 */

// Tangkap error yang tidak ditangkap
window.onerror = function (message, source, lineno, colno, error) {
  const msg = message.toString();

  // Indikator yang sangat spesifik dan aman untuk disembunyikan
  const isSupabaseWebSocketError =
    msg.includes("WebSocket connection to 'wss://qwidhvmdcaituefyzkeo.supabase.co/realtime") ||
    msg.includes("WebSocket is closed before the connection is established") ||
    msg.includes("failed: WebSocket is closed") ||
    (msg.includes("supabase.co") && msg.includes("WebSocket") && (msg.includes("is closed") || msg.includes("failed")));

  if (isSupabaseWebSocketError) {
    // Sembunyikan error ini dari konsol — tidak log, tidak tampilkan sebagai error standar
    return true; // Mencegah default browser handler menampilkan pesan ke konsol
  }

  // Untuk error lain, log seperti biasa
  console.error('Global error caught by window.onerror:', {
    message,
    source,
    lineno,
    colno,
    error,
  });
  return false; // biarkan browser tetap menangkap secara default juga
};

// Tangkap promise rejection yang tidak ditangkap
window.onunhandledrejection = function (event) {
  console.error('Unhandled promise rejection caught:', event.reason);
};

// Tidak perlu ekspor apa-apa — cukup dieksekusi untuk side effect