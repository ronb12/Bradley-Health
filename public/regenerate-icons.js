const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Function to generate PNG from SVG content
async function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Set background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#1d4ed8');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw heart
  const heartSize = size * 0.4;
  const heartX = size / 2;
  const heartY = size * 0.42;
  
  ctx.save();
  ctx.translate(heartX, heartY);
  ctx.scale(heartSize / 24, heartSize / 24);
  
  // Heart gradient
  const heartGradient = ctx.createLinearGradient(-12, -12, 12, 12);
  heartGradient.addColorStop(0, '#ef4444');
  heartGradient.addColorStop(1, '#dc2626');
  
  ctx.fillStyle = heartGradient;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-6, -6, -12, -3, -12, 3);
  ctx.bezierCurveTo(-12, 9, -6, 15, 0, 21);
  ctx.bezierCurveTo(6, 15, 12, 9, 12, 3);
  ctx.bezierCurveTo(12, -3, 6, -6, 0, 6);
  ctx.fill();
  
  // Add shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  
  ctx.restore();
  
  // Lifeline removed for cleaner design
  
  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.08}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add text shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  
  ctx.fillText('Bradley Health', size / 2, size * 0.83);
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`assets/${filename}`, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Generate all icon sizes
async function generateAllIcons() {
  const sizes = [
    { size: 72, name: 'icon-72.png' },
    { size: 96, name: 'icon-96.png' },
    { size: 144, name: 'icon-144.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' }
  ];
  
  for (const { size, name } of sizes) {
    await generateIcon(size, name);
  }
  
  console.log('All icons generated successfully!');
}

generateAllIcons().catch(console.error);
