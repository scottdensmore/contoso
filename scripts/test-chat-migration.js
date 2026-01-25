const fs = require('fs');
const path = require('path');

const chatDir = path.join(__dirname, '../services/chat');
const packageJsonPath = path.join(chatDir, 'package.json');

console.log('Checking for chat service migration...');

if (!fs.existsSync(chatDir)) {
  console.error('FAIL: services/chat directory does not exist.');
  process.exit(1);
}

if (!fs.existsSync(packageJsonPath)) {
  console.error('FAIL: services/chat/package.json does not exist.');
  process.exit(1);
}

console.log('SUCCESS: services/chat directory and package.json exist.');
process.exit(0);
