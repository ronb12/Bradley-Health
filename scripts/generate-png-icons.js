const fs = require('fs');
const path = require('path');

// Create a simple HTML file to convert SVG to PNG
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .icon-container { 
            display: inline-block; 
            margin: 10px; 
            padding: 10px; 
            background: white; 
            border-radius: 8px;
            text-align: center;
        }
        .icon-container img {
            display: block;
            margin: 0 auto;
        }
        .icon-container p {
            margin: 5px 0 0 0;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Bradley Health Icons</h1>
    <p>Right-click each icon and "Save image as..." to download the PNG files.</p>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="72" height="72" alt="72x72">
        <p>72x72</p>
    </div>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="96" height="96" alt="96x96">
        <p>96x96</p>
    </div>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="144" height="144" alt="144x144">
        <p>144x144</p>
    </div>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="192" height="192" alt="192x192">
        <p>192x192</p>
    </div>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="512" height="512" alt="512x512">
        <p>512x512</p>
    </div>
    
    <div class="icon-container">
        <img src="../assets/favicon.svg" width="180" height="180" alt="180x180">
        <p>180x180 (Apple)</p>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'icon-generator.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('Icon generator HTML created at:', htmlPath);
console.log('');
console.log('To generate PNG icons:');
console.log('1. Open icon-generator.html in your browser');
console.log('2. Right-click each icon and "Save image as..."');
console.log('3. Save with appropriate names:');
console.log('   - icon-72.png');
console.log('   - icon-96.png');
console.log('   - icon-144.png');
console.log('   - icon-192.png');
console.log('   - icon-512.png');
console.log('   - apple-touch-icon.png');
console.log('4. Move the PNG files to the assets/ directory'); 