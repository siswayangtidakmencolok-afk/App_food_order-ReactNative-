import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../config/supabase';

const { width, height } = Dimensions.get('window');

// ─── State tampilan setelah daftar ───────────────────────────
const VerificationSentScreen = ({ email, onBackToLogin }) => (
  <View style={styles.verificationContainer}>
    <Text style={{ fontSize: 72, marginBottom: 16 }}>📧</Text>
    <Text style={[styles.title, { marginBottom: 8 }]}>Cek Email Kamu!</Text>
    <Text style={[styles.subtitle, { textAlign: 'center', lineHeight: 22 }]}>
      Kami kirim link verifikasi ke:{'\n'}
      <Text style={{ fontWeight: 'bold' }}>{email}</Text>
    </Text>

    <View style={[styles.card, { marginTop: 32 }]}>
      <Text style={styles.verifyInfo}>
        ✅ Buka email dari <Text style={{ fontWeight: 'bold' }}>FoodsStreets</Text>{'\n'}
        ✅ Klik tombol <Text style={{ fontWeight: 'bold' }}>"Verifikasi Sekarang"</Text>{'\n'}
        ✅ Kembali ke sini dan login
      </Text>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={onBackToLogin}
      >
        <LinearGradient
          colors={['#EE4D2D', '#b22204']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.buttonText}>Sudah Verifikasi? Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.resendNote}>
        Tidak dapat email? Cek folder Spam atau coba daftar ulang.
      </Text>
    </View>
  </View>
);

// ─── Main AuthScreen ──────────────────────────────────────────
const AuthScreen = () => {
  const [mode, setMode]                   = useState('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [name, setName]                   = useState('');
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sentToEmail, setSentToEmail]     = useState('');
  const [isMounted, setIsMounted]         = useState(false);

  // Fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ── Login ──
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        Alert.alert(
          'Email Belum Diverifikasi',
          'Silakan cek email kamu dan klik link verifikasi sebelum login.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('Invalid login credentials')) {
        Alert.alert('Login Gagal', 'Email atau password salah. Coba lagi.');
      } else {
        Alert.alert('Login Gagal', error.message);
      }
    }
  };

  // ── Register ──
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: 'aplikasipemesananmakanan://auth/callback',
      },
    });
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        Alert.alert('Email Sudah Terdaftar', 'Gunakan email lain atau langsung login.');
      } else {
        Alert.alert('Register Gagal', error.message);
      }
      return;
    }

    if (data?.user && !data.session) {
      setSentToEmail(email.trim().toLowerCase());
      setVerificationSent(true);
    }
  };

  // ── Forgot Password ──
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Info', 'Masukkan email kamu dulu, lalu klik "Lupa password?".');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'aplikasipemesananmakanan://auth/reset-password' }
    );
    setLoading(false);
    if (error) {
      Alert.alert('Gagal', error.message);
    } else {
      Alert.alert('Email Terkirim', 'Cek email kamu untuk reset password.');
    }
  };

  const handleOAuthLogin = async (provider) => {
    if (provider === 'Google') {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
      } catch (error) {
        Alert.alert('Login Gagal', error.message);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Info', `Fitur Login dengan ${provider} belum dikonfigurasi.`);
    }
  };

  if (verificationSent) {
    return (
      <VerificationSentScreen
        email={sentToEmail}
        onBackToLogin={() => {
          setVerificationSent(false);
          setMode('login');
          setPassword('');
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fcf9f8', opacity: isMounted ? 1 : 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <LinearGradient
                colors={['#EE4D2D', '#b22204']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>FoodsStreets</Text>
            
            <Text style={styles.welcomeTitle}>
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {mode === 'login' ? 'Masuk untuk melanjutkan petualangan kuliner Anda' : 'Daftar sekarang dan nikmati makanan favorit Anda'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            
            {/* Nama (Only Register) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="account" size={20} color="#847464" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nama Anda"
                    placeholderTextColor="#a0a0a0"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="email" size={20} color="#847464" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor="#a0a0a0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                {mode === 'login' && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPass}>Lupa password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="lock" size={20} color="#847464" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Min. 6 karakter"
                  placeholderTextColor="#a0a0a0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIconWrap}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#847464" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EE4D2D', '#b22204']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {mode === 'login' ? 'Masuk' : 'Daftar'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              atau {mode === 'login' ? 'masuk' : 'daftar'} dengan
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Options */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuthLogin('Google')} activeOpacity={0.6} underlayColor="#eee">
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3002/3002219.png' }} 
                style={styles.socialIcon} 
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuthLogin('Apple')} activeOpacity={0.6} underlayColor="#eee">
              <MaterialCommunityIcons name="apple" size={24} color="#000" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footerWrap}>
            <Text style={styles.footerText}>
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            </Text>
            <TouchableOpacity onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setPassword('');
              setName('');
            }}>
              <Text style={styles.footerLink}>
                {mode === 'login' ? 'Daftar di sini' : 'Masuk'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  verificationContainer: {
    flex: 1,
    backgroundColor: '#fcf9f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrap: {
    marginBottom: 24,
    transform: [{ rotate: '3deg' }],
    shadowColor: '#EE4D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#825100',
    letterSpacing: -0.5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#211a13',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#524536',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#524536',
    marginBottom: 6,
    paddingLeft: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
    marginBottom: 6,
  },
  forgotPass: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EE4D2D',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8f4',
    borderWidth: 1,
    borderColor: '#d6c3b0',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1b1c1c',
  },
  eyeIconWrap: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#EE4D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d6c3b0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#847464',
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff8f4',
    borderWidth: 1,
    borderColor: '#d6c3b0',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#211a13',
  },
  footerWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#524536',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EE4D2D',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#1b1c1c' },
  subtitle: { fontSize: 16, color: '#524536' },
  verifyInfo: { fontSize: 14, lineHeight: 26, color: '#444', textAlign: 'center' },
  resendNote: { fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 12 },
});

export default AuthScreen;