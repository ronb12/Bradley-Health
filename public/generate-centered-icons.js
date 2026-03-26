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

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Red Heart centered and larger
    const heartSize = size * 0.6; // Increased size
    const heartX = size / 2;
    const heartY = size / 2; // Centered vertically
    
    ctx.save();
    ctx.translate(heartX, heartY);
    ctx.scale(heartSize / 24, heartSize / 24);
    
    // Heart gradient
    const heartGradient = ctx.createLinearGradient(0, 0, 24, 24);
    heartGradient.addColorStop(0, '#ef4444');
    heartGradient.addColorStop(1, '#dc2626');
    
    // Heart shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = size / 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = size / 90;
    
    // Heart shape (red with gradient)
    ctx.fillStyle = heartGradient;
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

    // Lifeline/Heartbeat inside the heart
    const lineY = size / 2 - size * 0.05; // Positioned inside the heart
    const lineWidth = size * 0.6; // Shorter line to fit inside heart
    const lineX = (size - lineWidth) / 2;
    
    // Reset shadow for line
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, size / 60);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add text shadow for line
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = size / 90;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = size / 180;
    
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + lineWidth * 0.1, lineY - size * 0.02);
    ctx.lineTo(lineX + lineWidth * 0.2, lineY);
    ctx.lineTo(lineX + lineWidth * 0.3, lineY - size * 0.025);
    ctx.lineTo(lineX + lineWidth * 0.4, lineY);
    ctx.lineTo(lineX + lineWidth * 0.5, lineY - size * 0.01);
    ctx.lineTo(lineX + lineWidth * 0.6, lineY);
    ctx.lineTo(lineX + lineWidth * 0.7, lineY - size * 0.015);
    ctx.lineTo(lineX + lineWidth * 0.8, lineY);
    ctx.lineTo(lineX + lineWidth * 0.9, lineY - size * 0.005);
    ctx.lineTo(lineX + lineWidth, lineY);
    ctx.stroke();
    
    // Add small circles at the ends with shadow
    ctx.fillStyle = '#ffffff';
    const circleRadius = Math.max(1.5, size / 80);
    
    ctx.beginPath();
    ctx.arc(lineX, lineY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(lineX + lineWidth, lineY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add small dots along the line
    const dotPositions = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85];
    dotPositions.forEach(pos => {
        const dotX = lineX + lineWidth * pos;
        const dotY = lineY - (pos % 2 === 0 ? size * 0.005 : size * 0.015);
        ctx.beginPath();
        ctx.arc(dotX, dotY, Math.max(0.8, size / 150), 0, 2 * Math.PI);
        ctx.fill();
    });

    // Text - Bradley Health with improved styling
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = size / 90;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = size / 180;
    
    // Add letter spacing effect
    const text = 'Bradley Health';
    const letterSpacing = fontSize * 0.05;
    let x = size / 2;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        ctx.fillText(char, x, size - size * 0.05);
        x += ctx.measureText(char).width + letterSpacing;
    }

    return canvas;
}

// Generate all icons
iconSizes.forEach(icon => {
    console.log(`Generating centered ${icon.name} (${icon.size}x${icon.size}) with font size ${icon.fontSize}px`);
    const canvas = createIcon(icon.size, icon.fontSize);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`assets/${icon.name}`, buffer);
    console.log(`✅ Created centered ${icon.name}`);
});

console.log('\n🎉 All centered icons generated successfully!');
