const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../images');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icon function
function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a56db';
    ctx.fillRect(0, 0, size, size);

    // Draw "BH" text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BH', size / 2, size / 2);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), buffer);
}

// Generate favicon
function generateFavicon() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a56db';
    ctx.fillRect(0, 0, 32, 32);

    // Draw "BH" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BH', 16, 16);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, 'favicon.png'), buffer);
}

// Generate all icons
generateIcon(192);
generateIcon(512);
generateFavicon();

console.log('Icons generated successfully!'); 