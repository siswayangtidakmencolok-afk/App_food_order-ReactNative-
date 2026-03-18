import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://qwidhvmdcaituefyzkeo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aWRodm1kY2FpdHVlZnl6a2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTQ1OTEsImV4cCI6MjA4OTMzMDU5MX0.4C1T9wOb-oeQYONQPcb5dvNXC6U7NNdPhSrA_fZ126k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: false,  // ← matikan auto refresh
    persistSession: false,    // ← tidak simpan session
    detectSessionInUrl: Platform.OS === 'web',
  },
});