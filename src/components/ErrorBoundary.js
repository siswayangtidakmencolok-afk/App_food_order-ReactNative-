import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error dibatasi oleh ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Maaf, terjadi kesalahan.</Text>
          <Text style={styles.fallbackMessage}>
            Sepertinya ada masalah yang tidak terduga. Silakan muat ulang halaman atau coba lagi nanti.
          </Text>
          <Button title="Muat Ulang Halaman" onPress={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }} />
          <ActivityIndicator size="large" color="#EE4D2D" style={{ marginTop: 12 }} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fcf9f8',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b1c1c',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackMessage: {
    fontSize: 14,
    color: '#524536',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});