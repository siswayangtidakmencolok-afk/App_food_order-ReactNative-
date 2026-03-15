import { Platform, Text, View } from 'react-native';

export default function SuccessAnimation({ style }) {
  if (Platform.OS === 'web') {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60 }}>✅</Text>
      </View>
    );
  }

  const LottieView = require('lottie-react-native').default;
  return (
    <LottieView
      source={require('../assets/lottie/success.json')}
      autoPlay
      loop={false}
      style={style}
    />
  );
}