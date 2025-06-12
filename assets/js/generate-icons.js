const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../images');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icon function
function generateIcon(size, filename) {
    // Calculate appropriate adjustments based on size
    const radius = Math.round(size * 0.2); // 20% of size
    const strokeWidth = Math.round(size * 0.08); // 8% of size for main strokes
    const circleStrokeWidth = Math.round(size * 0.04); // 4% of size for circle
    const circleRadius = Math.round(size * 0.3); // 30% of size
    
    // Calculate positions
    const center = size / 2;
    const start = Math.round(size * 0.28); // 28% from edge
    const end = Math.round(size * 0.72); // 72% from edge

    // Create SVG content
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1a56db" rx="${radius}" ry="${radius}"/>
  <path d="${center} ${start}v${end - start}M${start} ${center}h${end - start}" stroke="#ffffff" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <circle cx="${center}" cy="${center}" r="${circleRadius}" stroke="#ffffff" stroke-width="${circleStrokeWidth}" fill="none"/>
</svg>`;

    // Use fetch to save the file
    fetch(filename, {
        method: 'PUT',
        headers: {
            'Content-Type': 'image/svg+xml'
        },
        body: svgContent
    })
    .then(() => console.log(`Generated ${filename}`))
    .catch(err => console.error(`Error generating ${filename}:`, err));
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
function generateAllIcons() {
    // Main app icons
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    sizes.forEach(size => {
        generateIcon(size, `../icons/icon-${size}x${size}.svg`);
    });
    
    // Specialized icons can be created separately
    console.log('Icon generation complete!');
}

// Run the generation function
// Uncomment to run: generateAllIcons();

console.log('Icons generated successfully!'); 