import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://qwidhvmdcaituefyzkeo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aWRodm1kY2FpdHVlZnl6a2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTQ1OTEsImV4cCI6MjA4OTMzMDU5MX0.4C1T9wOb-oeQYONQPcb5dvNXC6U7NNdPhSrA_fZ126k';

// Fungsi untuk mendapatkan storage yang aman untuk web dan native
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Cek apakah localStorage tersedia (untuk SSR/bundling safety)
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    // Fallback ke memory storage jika localStorage tidak tersedia
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return AsyncStorage;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
