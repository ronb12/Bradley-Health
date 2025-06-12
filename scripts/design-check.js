const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
    viewportSizes: [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 375, height: 667, name: 'Mobile Medium' },
        { width: 414, height: 736, name: 'Mobile Large' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop Small' },
        { width: 1440, height: 900, name: 'Desktop Large' }
    ],
    colorPalette: {
        primary: '#1a56db',
        secondary: '#059669',
        accent: '#d97706',
        background: '#F7FAFC',
        text: '#111827'
    },
    requiredMetaTags: [
        'viewport',
        'theme-color',
        'description',
        'apple-mobile-web-app-capable',
        'apple-mobile-web-app-status-bar-style'
    ],
    requiredFonts: ['Inter'],
    requiredIcons: [
        'icon-192.png',
        'icon-512.png',
        'favicon.png'
    ]
};

// Design Check Results
const results = {
    passed: [],
    warnings: [],
    errors: []
};

// Helper Functions
function logResult(type, message, details = null) {
    const result = { message, details };
    results[type].push(result);
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (details) console.log('Details:', details);
}

function checkFileExists(filePath) {
    return fs.existsSync(path.join(process.cwd(), filePath));
}

function checkMetaTags(html) {
    const metaTags = html.match(/<meta[^>]+>/g) || [];
    const foundTags = new Set();
    
    metaTags.forEach(tag => {
        config.requiredMetaTags.forEach(required => {
            if (tag.includes(required)) {
                foundTags.add(required);
            }
        });
    });

    config.requiredMetaTags.forEach(tag => {
        if (!foundTags.has(tag)) {
            logResult('errors', `Missing required meta tag: ${tag}`);
        }
    });
}

function checkColorUsage(css) {
    const colorRegex = /#[0-9a-fA-F]{6}/g;
    const colors = css.match(colorRegex) || [];
    const uniqueColors = new Set(colors);

    // Check for hardcoded colors that aren't in our palette
    uniqueColors.forEach(color => {
        if (!Object.values(config.colorPalette).includes(color.toLowerCase())) {
            logResult('warnings', `Non-standard color used: ${color}`);
        }
    });
}

function checkResponsiveDesign(css) {
    const mediaQueries = css.match(/@media[^{]+{/g) || [];
    const breakpoints = new Set();

    mediaQueries.forEach(query => {
        const match = query.match(/\(max-width:\s*(\d+)px\)/);
        if (match) {
            breakpoints.add(parseInt(match[1]));
        }
    });

    // Check for common breakpoints
    const commonBreakpoints = [320, 375, 414, 768, 1024, 1440];
    commonBreakpoints.forEach(bp => {
        if (!breakpoints.has(bp)) {
            logResult('warnings', `Missing breakpoint for ${bp}px`);
        }
    });
}

function checkAccessibility(html) {
    // Check for alt text on images
    const images = html.match(/<img[^>]+>/g) || [];
    images.forEach(img => {
        if (!img.includes('alt=')) {
            logResult('errors', 'Image missing alt text');
        }
    });

    // Check for ARIA labels
    const interactiveElements = html.match(/<button|<a|<input|<select|<textarea/g) || [];
    interactiveElements.forEach(el => {
        if (!el.includes('aria-label=') && !el.includes('aria-labelledby=')) {
            logResult('warnings', 'Interactive element missing ARIA label');
        }
    });
}

function checkPerformance(html) {
    // Check for async/defer on scripts
    const scripts = html.match(/<script[^>]+>/g) || [];
    scripts.forEach(script => {
        if (!script.includes('async') && !script.includes('defer')) {
            logResult('warnings', 'Script missing async/defer attribute');
        }
    });

    // Check for image optimization
    const images = html.match(/<img[^>]+>/g) || [];
    images.forEach(img => {
        if (!img.includes('loading="lazy"')) {
            logResult('warnings', 'Image missing lazy loading');
        }
    });
}

function checkMobileOptimization(html) {
    // Check for touch targets
    const interactiveElements = html.match(/<button|<a|<input|<select|<textarea/g) || [];
    interactiveElements.forEach(el => {
        if (!el.includes('min-height="44px"') && !el.includes('min-height: 44px')) {
            logResult('warnings', 'Interactive element might be too small for touch');
        }
    });

    // Check for mobile-specific meta tags
    if (!html.includes('apple-mobile-web-app-capable')) {
        logResult('errors', 'Missing mobile web app capability meta tag');
    }
}

function checkVisualConsistency(css) {
    // Check for consistent spacing
    const spacingRegex = /margin|padding/g;
    const spacingValues = css.match(spacingRegex) || [];
    const uniqueSpacing = new Set(spacingValues);

    if (uniqueSpacing.size > 10) {
        logResult('warnings', 'Too many different spacing values used');
    }

    // Check for consistent font sizes
    const fontSizeRegex = /font-size:\s*(\d+)px/g;
    const fontSizes = css.match(fontSizeRegex) || [];
    const uniqueSizes = new Set(fontSizes);

    if (uniqueSizes.size > 8) {
        logResult('warnings', 'Too many different font sizes used');
    }
}

// Main Check Function
function checkDesign() {
    console.log('Starting design check...\n');

    // Check required files
    config.requiredIcons.forEach(icon => {
        if (!checkFileExists(`assets/images/${icon}`)) {
            logResult('errors', `Missing required icon: ${icon}`);
        }
    });

    // Check HTML files
    const htmlFiles = ['index.html', 'login.html', 'dashboard.html', 'blood-pressure.html', 'profile.html'];
    htmlFiles.forEach(file => {
        if (checkFileExists(file)) {
            const html = fs.readFileSync(file, 'utf8');
            checkMetaTags(html);
            checkAccessibility(html);
            checkPerformance(html);
            checkMobileOptimization(html);
        } else {
            logResult('errors', `Missing required file: ${file}`);
        }
    });

    // Check CSS
    if (checkFileExists('assets/style.css')) {
        const css = fs.readFileSync('assets/style.css', 'utf8');
        checkColorUsage(css);
        checkResponsiveDesign(css);
        checkVisualConsistency(css);
    } else {
        logResult('errors', 'Missing style.css file');
    }

    // Generate Report
    console.log('\n=== Design Check Report ===');
    console.log(`\nPassed: ${results.passed.length}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log(`Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(error => {
            console.log(`- ${error.message}`);
            if (error.details) console.log(`  Details: ${error.details}`);
        });
    }

    if (results.warnings.length > 0) {
        console.log('\nWarnings:');
        results.warnings.forEach(warning => {
            console.log(`- ${warning.message}`);
            if (warning.details) console.log(`  Details: ${warning.details}`);
        });
    }

    // Exit with appropriate code
    process.exit(results.errors.length > 0 ? 1 : 0);
}

// Run the check
checkDesign(); 