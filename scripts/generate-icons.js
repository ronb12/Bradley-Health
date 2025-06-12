const fs = require('fs');
const path = require('path');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '../assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Helper function to create an SVG icon
function createSvgIcon(size, color = '#1a56db') {
  const fontSize = Math.floor(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${color}" rx="${size * 0.2}" />
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}px" 
    fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">BH</text>
</svg>`;
}

// Create favicon-16x16.png (as SVG for now)
fs.writeFileSync(
  path.join(iconsDir, 'favicon-16x16.svg'),
  createSvgIcon(16)
);

// Create favicon-32x32.png (as SVG for now)
fs.writeFileSync(
  path.join(iconsDir, 'favicon-32x32.svg'),
  createSvgIcon(32)
);

// Create icon-192.png (as SVG for now)
fs.writeFileSync(
  path.join(iconsDir, 'icon-192.svg'),
  createSvgIcon(192)
);

// Create BP icon
fs.writeFileSync(
  path.join(iconsDir, 'bp-icon.svg'),
  createSvgIcon(192, '#e53e3e')
);

// Create Med icon
fs.writeFileSync(
  path.join(iconsDir, 'med-icon.svg'),
  createSvgIcon(192, '#38a169')
);

// Create all the standard sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.svg`),
    createSvgIcon(size)
  );
});

console.log('✅ Icons generated successfully!'); 