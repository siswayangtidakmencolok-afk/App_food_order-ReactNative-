import { Text, View } from 'react-native';

const emojis = {
  'food-loading': '🍔',
  'delivery': '🛵',
  'success': '🎉',
};

export default function OnboardingAnimation({ name, style }) {
  return (
    <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 100 }}>{emojis[name] || '✨'}</Text>
    </View>
  );
}