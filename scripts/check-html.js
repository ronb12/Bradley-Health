const fs = require('fs');
const path = require('path');

// Required meta tags
const REQUIRED_META_TAGS = [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'theme-color', content: '#1a56db' }
];

// Required accessibility attributes
const REQUIRED_ACCESSIBILITY = [
    'role="main"',
    'aria-label',
    'aria-live',
    'aria-hidden="true"',
    'aria-required="true"'
];

// Required script attributes
const REQUIRED_SCRIPT_ATTRS = ['defer'];

// Results storage
const results = {
    passed: [],
    warnings: [],
    errors: []
};

// Helper function to log results
function logResult(type, file, message) {
    results[type].push({ file, message });
}

// Check HTML file
function checkHtmlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath);

        // Check meta tags
        REQUIRED_META_TAGS.forEach(tag => {
            const regex = new RegExp(`<meta[^>]*name=["']${tag.name}["'][^>]*content=["']${tag.content}["'][^>]*>`, 'i');
            if (!regex.test(content)) {
                logResult('errors', fileName, `Missing required meta tag: ${tag.name}`);
            }
        });

        // Check accessibility attributes
        REQUIRED_ACCESSIBILITY.forEach(attr => {
            if (!content.includes(attr)) {
                logResult('warnings', fileName, `Consider adding ${attr} for better accessibility`);
            }
        });

        // Check script attributes
        const scripts = content.match(/<script[^>]*>/g) || [];
        scripts.forEach(script => {
            REQUIRED_SCRIPT_ATTRS.forEach(attr => {
                if (!script.includes(attr)) {
                    logResult('warnings', fileName, `Consider adding ${attr} to script tag`);
                }
            });
        });

        // Check for basic structure
        if (!content.includes('<!DOCTYPE html>')) {
            logResult('errors', fileName, 'Missing DOCTYPE declaration');
        }
        if (!content.includes('<html lang="en">')) {
            logResult('errors', fileName, 'Missing or incorrect HTML lang attribute');
        }
        if (!content.includes('<meta charset="UTF-8">')) {
            logResult('errors', fileName, 'Missing charset meta tag');
        }

        // Check for PWA support
        if (!content.includes('manifest.json')) {
            logResult('warnings', fileName, 'Missing PWA manifest link');
        }
        if (!content.includes('apple-touch-icon')) {
            logResult('warnings', fileName, 'Missing Apple touch icon');
        }

        // Check for mobile optimization
        if (!content.includes('mobile.css')) {
            logResult('warnings', fileName, 'Missing mobile-specific stylesheet');
        }

        // If no errors or warnings, mark as passed
        if (!results.errors.some(r => r.file === fileName) && 
            !results.warnings.some(r => r.file === fileName)) {
            logResult('passed', fileName, 'All checks passed');
        }
    } catch (error) {
        logResult('errors', path.basename(filePath), `Error reading file: ${error.message}`);
    }
}

// Main function
function main() {
    const htmlFiles = fs.readdirSync('.')
        .filter(file => file.endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.log('No HTML files found in current directory');
        return;
    }

    htmlFiles.forEach(file => checkHtmlFile(file));

    // Print results
    console.log('\n=== HTML Files Check Results ===\n');

    if (results.passed.length > 0) {
        console.log('✅ Passed:');
        results.passed.forEach(r => console.log(`  - ${r.file}: ${r.message}`));
        console.log();
    }

    if (results.warnings.length > 0) {
        console.log('⚠️ Warnings:');
        results.warnings.forEach(r => console.log(`  - ${r.file}: ${r.message}`));
        console.log();
    }

    if (results.errors.length > 0) {
        console.log('❌ Errors:');
        results.errors.forEach(r => console.log(`  - ${r.file}: ${r.message}`));
        console.log();
    }

    // Exit with appropriate code
    process.exit(results.errors.length > 0 ? 1 : 0);
}

main(); 