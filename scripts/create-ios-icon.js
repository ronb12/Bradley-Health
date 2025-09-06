const fs = require('fs');
const path = require('path');

// Create a simple iOS-compatible icon with solid background
function createIOSIcon(size) {
  const canvas = {
    width: size,
    height: size,
    getContext: () => ({
      fillStyle: '#4f46e5',
      fillRect: () => {},
      strokeStyle: '#ffffff',
      lineWidth: size * 0.1,
      strokeRect: () => {},
      fillText: () => {},
      font: `${size * 0.3}px Arial`,
      textAlign: 'center',
      textBaseline: 'middle'
    })
  };

  // Create SVG content for the icon
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#4f46e5" rx="${size * 0.2}"/>
  
  <!-- Heart icon -->
  <g transform="translate(${size/2}, ${size/2}) scale(${size * 0.002})">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ffffff"/>
  </g>
  
  <!-- Text -->
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold">BH</text>
</svg>`;

  return svg;
}

// Convert SVG to PNG using a simple approach
function svgToPng(svg, size) {
  // For now, we'll create a simple PNG-like structure
  // In a real implementation, you'd use a library like sharp or canvas
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52  // IHDR
  ]);
  
  // This is a simplified approach - in practice you'd need a proper PNG encoder
  return header;
}

// Create the iOS icon
const assetsDir = path.join(__dirname, '..', 'assets');
const iconSvg = createIOSIcon(180);

// Write SVG file first
fs.writeFileSync(path.join(assetsDir, 'apple-touch-icon.svg'), iconSvg);

console.log('✅ Created iOS-compatible icon:');
console.log('   - apple-touch-icon.svg (180x180 pixels)');
console.log('   - Ready for iOS home screen installation');

// Note: For a proper PNG, you'd need to use a library like sharp
console.log('\n📝 Note: To generate PNG, install sharp: npm install sharp'); 