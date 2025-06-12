const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Meta tags template
const META_TAGS = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#1a56db">
`;

// PWA links template
const PWA_LINKS = `
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.svg">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" sizes="32x32" href="assets/icons/favicon-32x32.svg">
    <link rel="icon" type="image/svg+xml" sizes="16x16" href="assets/icons/favicon-16x16.svg">
`;

// Stylesheet links template
const STYLESHEET_LINKS = `
    <!-- Stylesheets -->
    <link rel="stylesheet" href="assets/style.css">
    <link rel="stylesheet" href="assets/mobile.css" media="(max-width: 480px)">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
`;

// Fix HTML files
function fixHtmlFiles() {
  const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'));

  let filesFixed = 0;
  
  htmlFiles.forEach(file => {
    console.log(`Processing ${file}...`);
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix doctype and lang if missing
    if (!content.includes('<!DOCTYPE html>')) {
      content = '<!DOCTYPE html>\n' + content;
      modified = true;
    }
    
    if (!content.includes('<html lang="en">')) {
      content = content.replace(/<html[^>]*>/i, '<html lang="en">');
      if (!content.includes('<html')) {
        content = content.replace(/<!DOCTYPE html>/i, '<!DOCTYPE html>\n<html lang="en">');
      }
      modified = true;
    }
    
    // Fix head section
    if (!content.includes('<head>')) {
      content = content.replace(/<html[^>]*>/i, '$&\n<head>');
      content = content.replace(/<body/i, '</head>\n<body');
      modified = true;
    }
    
    // Handle special case where we have critical meta tag errors
    // Force overwrite the <head> section completely if needed
    if (!content.includes('<meta name="viewport"') || 
        !content.includes('<meta name="theme-color"')) {
      
      // Find the head section
      const headStartMatch = content.match(/<head[^>]*>/i);
      const headEndMatch = content.match(/<\/head>/i);
      
      if (headStartMatch && headEndMatch) {
        const headStartIndex = headStartMatch.index + headStartMatch[0].length;
        const headEndIndex = headEndMatch.index;
        
        // Extract title if it exists
        let title = 'Bradley Health';
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1];
        }
        
        // Extract description if it exists
        let description = 'Your personal health companion';
        const descMatch = content.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        if (descMatch) {
          description = descMatch[1];
        }
        
        // New head content
        const newHeadContent = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#1a56db">
    <meta name="description" content="${description}">
    <title>${title}</title>
    
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.svg">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" sizes="32x32" href="assets/icons/favicon-32x32.svg">
    <link rel="icon" type="image/svg+xml" sizes="16x16" href="assets/icons/favicon-16x16.svg">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="assets/style.css">
    <link rel="stylesheet" href="assets/mobile.css" media="(max-width: 480px)">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">`;

        // Replace the head content
        content = content.slice(0, headStartIndex) + newHeadContent + content.slice(headEndIndex);
        modified = true;
      } else {
        // Add meta tags if missing
        if (!content.includes('<meta charset="UTF-8">')) {
          content = content.replace(/<head>\s*/i, '<head>\n' + META_TAGS);
          modified = true;
        } else {
          // Check each meta tag and add if missing
          const metaTags = META_TAGS.trim().split('\n');
          for (const tag of metaTags) {
            const tagName = tag.match(/name="([^"]+)"/);
            if (tagName && !content.includes(tagName[0])) {
              content = content.replace(/<head>[\s\S]*?<meta charset="UTF-8">/i, '$&\n' + tag);
              modified = true;
            }
          }
        }
        
        // Add PWA links if missing
        if (!content.includes('manifest.json')) {
          // Insert after meta tags or before stylesheets
          const insertPoint = content.includes('<link rel="stylesheet"') 
            ? content.indexOf('<link rel="stylesheet"')
            : content.indexOf('</head>');
            
          content = content.slice(0, insertPoint) + 
                    PWA_LINKS + 
                    content.slice(insertPoint);
          modified = true;
        }
        
        // Add mobile stylesheet if missing
        if (!content.includes('mobile.css')) {
          // Insert before closing head tag or before first script
          const insertPoint = content.includes('<script') 
            ? content.indexOf('<script')
            : content.indexOf('</head>');
            
          content = content.slice(0, insertPoint) + 
                    STYLESHEET_LINKS + 
                    content.slice(insertPoint);
          modified = true;
        }
      }
    }
    
    // Add defer to scripts
    if (content.includes('<script') && !content.includes('defer')) {
      content = content.replace(/<script([^>]*)>/g, (match, p1) => {
        if (!p1.includes('defer') && !p1.includes('async')) {
          return `<script${p1} defer>`;
        }
        return match;
      });
      modified = true;
    }
    
    // Add aria attributes to main content
    if (!content.includes('role="main"')) {
      content = content.replace(/<main([^>]*)>/g, '<main$1 role="main">');
      // If no main tag, try to add to the main content div
      if (!content.includes('role="main"')) {
        content = content.replace(/<div[^>]*class="[^"]*main[^"]*"[^>]*>/i, '$& role="main"');
      }
      modified = true;
    }
    
    // Add aria labels to images without alt text
    content = content.replace(/<img([^>]*)>/g, (match, p1) => {
      if (!p1.includes('alt=')) {
        return `<img${p1} alt="" aria-hidden="true">`;
      }
      return match;
    });
    
    // Add aria-hidden to icons
    content = content.replace(/<i([^>]*)class="fa[^"]*"([^>]*)>/g, (match, p1, p2) => {
      if (!match.includes('aria-hidden')) {
        return `<i${p1}class="fa${p1.includes('class=') ? '' : ' '}${p2}" aria-hidden="true">`;
      }
      return match;
    });
    
    // Add aria-required to required inputs
    content = content.replace(/<input([^>]*)required([^>]*)>/g, (match, p1, p2) => {
      if (!match.includes('aria-required')) {
        return `<input${p1}required${p2} aria-required="true">`;
      }
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(file, content);
      filesFixed++;
      console.log(`✅ Fixed ${file}`);
    } else {
      console.log(`ℹ️ No changes needed for ${file}`);
    }
  });
  
  return filesFixed;
}

// Main function
function main() {
  try {
    console.log('Starting batch fix for HTML files...');
    const fixedCount = fixHtmlFiles();
    console.log(`\nCompleted! Fixed ${fixedCount} file(s).`);
  } catch (error) {
    console.error('Error in batch-fix script:', error);
    process.exit(1);
  }
}

main(); 