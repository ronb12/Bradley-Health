const fs = require('fs');
const path = require('path');

// Simple base64-encoded PNG icons (1x1 pixel, transparent)
// These are minimal valid PNG files that will work as placeholders
const icon72 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const icon96 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const icon144 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const icon192 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const icon512 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const appleTouchIcon = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Function to write base64 to file
function writeBase64ToFile(base64Data, filePath) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ Created: ${filePath}`);
}

// Create icons directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write all icon files
writeBase64ToFile(icon72, path.join(assetsDir, 'icon-72.png'));
writeBase64ToFile(icon96, path.join(assetsDir, 'icon-96.png'));
writeBase64ToFile(icon144, path.join(assetsDir, 'icon-144.png'));
writeBase64ToFile(icon192, path.join(assetsDir, 'icon-192.png'));
writeBase64ToFile(icon512, path.join(assetsDir, 'icon-512.png'));
writeBase64ToFile(appleTouchIcon, path.join(assetsDir, 'apple-touch-icon.png'));

console.log('');
console.log('🎉 All placeholder icons created successfully!');
console.log('');
console.log('📝 Note: These are minimal placeholder icons.');
console.log('   For production, use the icon generator to create proper icons:');
console.log('   http://localhost:8000/scripts/icon-generator-simple.html');
console.log('');
console.log('🔧 The PWA icon error should now be resolved.'); 