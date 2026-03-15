import LottieView from 'lottie-react-native';

const sources = {
  'food-loading': require('../assets/lottie/food-loading.json'),
  'delivery': require('../assets/lottie/delivery.json'),
  'success': require('../assets/lottie/success.json'),
};

export default function OnboardingAnimation({ name, style }) {
  return (
    <LottieView
      source={sources[name]}
      autoPlay
      loop
      style={style}
    />
  );
}