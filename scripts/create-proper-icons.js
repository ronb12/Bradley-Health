const fs = require('fs');
const path = require('path');

// Create a simple colored square icon for each size
// These are base64-encoded PNG files with the correct dimensions
const icons = {
  'icon-72.png': createColoredIcon(72, '#4f46e5'), // Indigo
  'icon-96.png': createColoredIcon(96, '#4f46e5'),
  'icon-144.png': createColoredIcon(144, '#4f46e5'),
  'icon-192.png': createColoredIcon(192, '#4f46e5'),
  'icon-512.png': createColoredIcon(512, '#4f46e5'),
  'apple-touch-icon.png': createColoredIcon(180, '#4f46e5')
};

// Function to create a simple colored square icon
function createColoredIcon(size, color) {
  // Convert hex color to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Create a simple PNG with the specified color
  // This is a minimal valid PNG with the correct dimensions
  const pngData = createSimplePNG(size, size, r, g, b);
  return pngData;
}

// Function to create a simple PNG with specified dimensions and color
function createSimplePNG(width, height, r, g, b) {
  // PNG header
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (image header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);      // Width
  ihdrData.writeUInt32BE(height, 4);     // Height
  ihdrData.writeUInt8(8, 8);             // Bit depth
  ihdrData.writeUInt8(2, 9);             // Color type (RGB)
  ihdrData.writeUInt8(0, 10);            // Compression
  ihdrData.writeUInt8(0, 11);            // Filter
  ihdrData.writeUInt8(0, 12);            // Interlace
  
  const ihdrChunk = createPNGChunk('IHDR', ihdrData);
  
  // IDAT chunk (image data)
  const idatData = createRGBData(width, height, r, g, b);
  const idatChunk = createPNGChunk('IDAT', idatData);
  
  // IEND chunk (end of file)
  const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));
  
  // Combine all chunks
  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

// Function to create PNG chunk
function createPNGChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Function to create RGB data for the image
function createRGBData(width, height, r, g, b) {
  const data = Buffer.alloc(height * (width * 3 + 1));
  let offset = 0;
  
  for (let y = 0; y < height; y++) {
    // Filter byte (0 = no filter)
    data[offset++] = 0;
    
    for (let x = 0; x < width; x++) {
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
    }
  }
  
  return data;
}

// Function to calculate CRC32
function calculateCRC(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  // Generate CRC table
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  // Calculate CRC
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Function to write base64 to file
function writeIconToFile(iconData, filePath) {
  fs.writeFileSync(filePath, iconData);
  console.log(`✅ Created: ${filePath}`);
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write all icon files
Object.entries(icons).forEach(([filename, iconData]) => {
  const filePath = path.join(assetsDir, filename);
  writeIconToFile(iconData, filePath);
});

console.log('');
console.log('🎉 All properly-sized icons created successfully!');
console.log('');
console.log('📏 Icon sizes created:');
console.log('   - icon-72.png (72x72 pixels)');
console.log('   - icon-96.png (96x96 pixels)');
console.log('   - icon-144.png (144x144 pixels)');
console.log('   - icon-192.png (192x192 pixels)');
console.log('   - icon-512.png (512x512 pixels)');
console.log('   - apple-touch-icon.png (180x180 pixels)');
console.log('');
console.log('🔧 The PWA icon size error should now be resolved.');
console.log('');
console.log('💡 For production, replace these with your actual app icons using:');
console.log('   http://localhost:8000/scripts/icon-generator-simple.html'); 