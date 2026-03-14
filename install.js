const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Starting npm install...');
  const stdout = execSync('npm install lottie-react-native lottie-web react-native-web-lottie react-native-reanimated --legacy-peer-deps --no-audit --no-fund');
  fs.writeFileSync('install.log', `STDOUT:\n${stdout}`);
  console.log('Finished npm install.');
} catch (error) {
  fs.writeFileSync('install.log', `ERROR:\n${error.message}\nSTDOUT:\n${error.stdout}\nSTDERR:\n${error.stderr}`);
}
