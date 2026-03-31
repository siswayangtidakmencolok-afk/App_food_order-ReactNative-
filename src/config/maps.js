// src/config/maps.js

/**
 * Geoapify Configuration
 * 
 * Untuk Tugas Proyek:
 * 1. Daftar gratis di https://www.geoapify.com/ (Tanpa Kartu Kredit)
 * 2. Ambil "API Key" Anda di Dashboard.
 * 3. Ganti 'YOUR_GEOAPIFY_KEY' di bawah dengan Key Anda.
 */

export const GEOAPIFY_KEY = '370c3e0755df4066a36f2201110a11ca'; // Placeholder Key (Ganti dengan punyamu!)

export const MAP_TILE_URL = (isDark = false) => {
  // Pilihan Style: osm-bright-smooth (Terang/Standard), dark-matter (Gelap)
  const style = isDark ? 'dark-matter' : 'osm-bright-smooth';
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;
};

export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.geoapify.com/">Geoapify</a>';
