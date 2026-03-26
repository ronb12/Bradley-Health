const fs = require('fs');
const { createCanvas } = require('canvas');

const iconSizes = [
    { size: 72, name: 'icon-72.png', fontSize: 8 },
    { size: 96, name: 'icon-96.png', fontSize: 10 },
    { size: 144, name: 'icon-144.png', fontSize: 14 },
    { size: 192, name: 'icon-192.png', fontSize: 18 },
    { size: 512, name: 'icon-512.png', fontSize: 24 },
    { size: 180, name: 'apple-touch-icon.png', fontSize: 16 }
];

function createIcon(size, fontSize) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Blue background
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, size, size);

    // Red Heart
    const heartSize = size * 0.4;
    const heartX = size / 2;
    const heartY = size * 0.4;
    
    ctx.save();
    ctx.translate(heartX, heartY);
    ctx.scale(heartSize / 24, heartSize / 24);
    
    // Heart shape (red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(12, 21.35);
    ctx.lineTo(10.55, 20.03);
    ctx.bezierCurveTo(5.4, 15.36, 2, 12.28, 2, 8.5);
    ctx.bezierCurveTo(2, 5.42, 4.42, 3, 7.5, 3);
    ctx.bezierCurveTo(9.24, 3, 10.91, 3.81, 12, 5.09);
    ctx.bezierCurveTo(13.09, 3.81, 14.76, 3, 16.5, 3);
    ctx.bezierCurveTo(19.58, 3, 22, 5.42, 22, 8.5);
    ctx.bezierCurveTo(22, 12.28, 18.6, 15.36, 13.45, 20.03);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    // Lifeline/Heartbeat
    const lineY = size * 0.6;
    const lineWidth = size * 0.8;
    const lineX = (size - lineWidth) / 2;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, size / 60);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + lineWidth * 0.1, lineY - size * 0.02);
    ctx.lineTo(lineX + lineWidth * 0.2, lineY);
    ctx.lineTo(lineX + lineWidth * 0.3, lineY - size * 0.03);
    ctx.lineTo(lineX + lineWidth * 0.4, lineY);
    ctx.lineTo(lineX + lineWidth * 0.5, lineY - size * 0.01);
    ctx.lineTo(lineX + lineWidth * 0.6, lineY);
    ctx.lineTo(lineX + lineWidth * 0.7, lineY - size * 0.015);
    ctx.lineTo(lineX + lineWidth * 0.8, lineY);
    ctx.lineTo(lineX + lineWidth * 0.9, lineY - size * 0.01);
    ctx.lineTo(lineX + lineWidth, lineY);
    ctx.stroke();
    
    // Add small circles at the ends
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lineX, lineY, Math.max(1, size / 60), 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(lineX + lineWidth, lineY, Math.max(1, size / 60), 0, 2 * Math.PI);
    ctx.fill();

    // Text - Bradley Health
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Bradley Health', size / 2, size - size * 0.05);

    return canvas;
}

// Generate all icons
iconSizes.forEach(icon => {
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size}) with font size ${icon.fontSize}px`);
    const canvas = createIcon(icon.size, icon.fontSize);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`assets/${icon.name}`, buffer);
    console.log(`✅ Created ${icon.name}`);
});

console.log('\n🎉 All icons generated successfully with "Bradley Health" text!');
