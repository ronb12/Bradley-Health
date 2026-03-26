const fs = require('fs');
const path = require('path');

// Create a simple HTML file that can be used to generate icons
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: #f0f0f0; 
            font-family: Arial, sans-serif;
        }
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .icon-container { 
            background: white; 
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .icon-container img {
            display: block;
            margin: 0 auto 10px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .icon-container p {
            margin: 0;
            font-weight: bold;
            color: #333;
        }
        .icon-container .size {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        .instructions {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        .instructions h2 {
            color: #333;
            margin-top: 0;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="instructions">
        <h2>Bradley Health Icon Generator</h2>
        <p>To generate PNG icons for the PWA:</p>
        <ol>
            <li>Right-click each icon below and select "Save image as..."</li>
            <li>Save with the exact filename shown (e.g., "icon-72.png")</li>
            <li>Move all PNG files to the <code>assets/</code> directory</li>
            <li>Replace the placeholder files with these generated ones</li>
        </ol>
    </div>
    
    <div class="icon-grid">
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="72" height="72" alt="72x72">
            <p>icon-72.png</p>
            <div class="size">72x72 pixels</div>
        </div>
        
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="96" height="96" alt="96x96">
            <p>icon-96.png</p>
            <div class="size">96x96 pixels</div>
        </div>
        
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="144" height="144" alt="144x144">
            <p>icon-144.png</p>
            <div class="size">144x144 pixels</div>
        </div>
        
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="192" height="192" alt="192x192">
            <p>icon-192.png</p>
            <div class="size">192x192 pixels</div>
        </div>
        
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="512" height="512" alt="512x512">
            <p>icon-512.png</p>
            <div class="size">512x512 pixels</div>
        </div>
        
        <div class="icon-container">
            <img src="../assets/favicon.svg" width="180" height="180" alt="180x180">
            <p>apple-touch-icon.png</p>
            <div class="size">180x180 pixels (Apple)</div>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'icon-generator-simple.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Icon generator HTML created at:', htmlPath);
console.log('');
console.log('📋 Instructions:');
console.log('1. Open icon-generator-simple.html in your browser');
console.log('2. Right-click each icon and "Save image as..."');
console.log('3. Save with these exact names:');
console.log('   - icon-72.png');
console.log('   - icon-96.png');
console.log('   - icon-144.png');
console.log('   - icon-192.png');
console.log('   - icon-512.png');
console.log('   - apple-touch-icon.png');
console.log('4. Move all PNG files to the assets/ directory');
console.log('5. Replace the placeholder files');
console.log('');
console.log('🌐 Open in browser: http://localhost:8000/scripts/icon-generator-simple.html'); 