const fs = require('fs');
const path = require('path');

// Get list of HTML files
const htmlFiles = fs.readdirSync('.')
  .filter(file => file.endsWith('.html'));

// Base tag content
const baseTagLine = '  <base href="" id="baseTag">';
const scriptTagLine = '  <script>if(window.location.hostname.includes("github.io")){document.getElementById("baseTag").href="/Bradley-Health/"}</script>';
const insertAfter = '<head>';

// Process each HTML file
htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  
  // Read file content
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if file already has base tag
  if (content.includes('<base href=') && content.includes('baseTag')) {
    console.log(`  Skipping ${file} - already has base tag`);
    return;
  }
  
  // Insert base tag after <head>
  const parts = content.split(insertAfter);
  if (parts.length !== 2) {
    console.log(`  Error processing ${file} - couldn't find <head> tag`);
    return;
  }
  
  const newContent = parts[0] + insertAfter + '\n' + baseTagLine + '\n' + scriptTagLine + parts[1];
  
  // Write updated content back to file
  fs.writeFileSync(file, newContent);
  console.log(`  Updated ${file}`);
});

console.log('All done!'); 