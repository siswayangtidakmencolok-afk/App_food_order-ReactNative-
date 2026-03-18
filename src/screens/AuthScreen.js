import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../config/supabase';

const AuthScreen = () => {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login Gagal', error.message);    
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);
    if (error) Alert.alert('Register Gagal', error.message);
    // Ganti jadi:
else {
  Alert.alert('Berhasil!', 'Akun dibuat! Silakan login.');
  setMode('login');
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🍔</Text>
      <Text style={styles.title}>FoodApp</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? 'Selamat datang kembali!' : 'Buat akun baru'}
      </Text>

      <View style={styles.card}>
        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>
                {mode === 'login' ? 'Masuk' : 'Daftar'}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={styles.switchText}>
            {mode === 'login'
              ? 'Belum punya akun? Daftar di sini'
              : 'Sudah punya akun? Masuk'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FF6347', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo:        { fontSize: 64, marginBottom: 8 },
  title:       { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle:    { fontSize: 16, color: '#fff', opacity: 0.9, marginBottom: 32 },
  card:        { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 },
  input:       { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  button:      { backgroundColor: '#FF6347', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  switchText:  { textAlign: 'center', color: '#FF6347', fontSize: 14, fontWeight: '600' },
});

export default AuthScreen;