const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock Data
const mockData = {
    user: {
        email: 'test@example.com',
        displayName: 'Test User',
        uid: 'test123'
    },
    bloodPressure: {
        systolic: 120,
        diastolic: 80,
        pulse: 72,
        timestamp: new Date().toISOString()
    },
    medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'daily' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'daily' }
    ],
    activities: [
        { type: 'exercise', duration: 30, intensity: 'moderate' },
        { type: 'sleep', duration: 8, quality: 'good' }
    ]
};

// Test Results
const results = {
    passed: [],
    warnings: [],
    errors: [],
    fixes: []
};

// Helper Functions
function logResult(type, message, details = null) {
    const result = { message, details };
    results[type].push(result);
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (details) console.log('Details:', details);
}

function applyFix(file, fix) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const fixedContent = fix(content);
        fs.writeFileSync(file, fixedContent);
        logResult('fixes', `Applied fix to ${file}`);
    } catch (error) {
        logResult('errors', `Failed to apply fix to ${file}: ${error.message}`);
    }
}

// Feature Tests
const featureTests = {
    // Authentication Tests
    testAuth: {
        name: 'Authentication',
        run: () => {
            const authFile = 'assets/js/firebase-init.js';
            if (!fs.existsSync(authFile)) {
                logResult('errors', 'Missing authentication initialization file');
                return false;
            }

            const content = fs.readFileSync(authFile, 'utf8');
            const hasAuthStateListener = content.includes('onAuthStateChanged');
            const hasSignInMethod = content.includes('signInWithEmailAndPassword');
            const hasSignOutMethod = content.includes('signOut');

            if (!hasAuthStateListener || !hasSignInMethod || !hasSignOutMethod) {
                logResult('errors', 'Missing required authentication methods');
                return false;
            }

            logResult('passed', 'Authentication features verified');
            return true;
        },
        fix: (content) => {
            if (!content.includes('onAuthStateChanged')) {
                content += `
// Add auth state listener
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.email);
    } else {
        console.log('User signed out');
    }
});`;
            }
            return content;
        }
    },

    // Blood Pressure Tests
    testBloodPressure: {
        name: 'Blood Pressure Management',
        run: () => {
            const bpFile = 'assets/js/blood-pressure-manager.js';
            if (!fs.existsSync(bpFile)) {
                logResult('errors', 'Missing blood pressure manager file');
                return false;
            }

            const content = fs.readFileSync(bpFile, 'utf8');
            const hasAddReading = content.includes('addReading');
            const hasGetReadings = content.includes('getReadings');
            const hasDeleteReading = content.includes('deleteReading');

            if (!hasAddReading || !hasGetReadings || !hasDeleteReading) {
                logResult('errors', 'Missing required blood pressure methods');
                return false;
            }

            logResult('passed', 'Blood pressure features verified');
            return true;
        },
        fix: (content) => {
            if (!content.includes('addReading')) {
                content += `
// Add blood pressure reading
async function addReading(reading) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const readingRef = firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .collection('readings')
            .doc();
            
        await readingRef.set({
            ...reading,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return readingRef.id;
    } catch (error) {
        console.error('Error adding reading:', error);
        throw error;
    }
}`;
            }
            return content;
        }
    },

    // PWA Tests
    testPWA: {
        name: 'PWA Features',
        run: () => {
            const manifestFile = 'manifest.json';
            const swFile = 'assets/js/service-worker.js';
            
            if (!fs.existsSync(manifestFile) || !fs.existsSync(swFile)) {
                logResult('errors', 'Missing PWA required files');
                return false;
            }

            const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
            const hasRequiredFields = manifest.name && manifest.icons && manifest.start_url;
            
            if (!hasRequiredFields) {
                logResult('errors', 'Missing required PWA manifest fields');
                return false;
            }

            logResult('passed', 'PWA features verified');
            return true;
        },
        fix: (content) => {
            const manifest = JSON.parse(content);
            if (!manifest.name) manifest.name = 'Bradley Health';
            if (!manifest.icons) manifest.icons = [
                {
                    "src": "assets/images/icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "assets/images/icon-512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ];
            if (!manifest.start_url) manifest.start_url = '/';
            return JSON.stringify(manifest, null, 2);
        }
    },

    // Mobile Responsiveness Tests
    testMobile: {
        name: 'Mobile Responsiveness',
        run: () => {
            const cssFile = 'assets/style.css';
            if (!fs.existsSync(cssFile)) {
                logResult('errors', 'Missing style file');
                return false;
            }

            const content = fs.readFileSync(cssFile, 'utf8');
            const hasMediaQueries = content.includes('@media');
            const hasTouchTargets = content.includes('min-height: 44px');
            const hasSafeArea = content.includes('safe-area-inset');

            if (!hasMediaQueries || !hasTouchTargets || !hasSafeArea) {
                logResult('errors', 'Missing mobile responsiveness features');
                return false;
            }

            logResult('passed', 'Mobile responsiveness verified');
            return true;
        },
        fix: (content) => {
            if (!content.includes('@media')) {
                content += `
/* Mobile Responsiveness */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .card {
        margin-bottom: 1rem;
    }
    
    button, 
    .button,
    .nav-item {
        min-height: 44px;
    }
}`;
            }
            return content;
        }
    },

    // Data Export Tests
    testExport: {
        name: 'Data Export',
        run: () => {
            const exportFile = 'assets/js/export-manager.js';
            if (!fs.existsSync(exportFile)) {
                logResult('errors', 'Missing export manager file');
                return false;
            }

            const content = fs.readFileSync(exportFile, 'utf8');
            const hasExportFunction = content.includes('exportData');
            const hasCSVExport = content.includes('toCSV');
            const hasJSONExport = content.includes('toJSON');

            if (!hasExportFunction || !hasCSVExport || !hasJSONExport) {
                logResult('errors', 'Missing required export features');
                return false;
            }

            logResult('passed', 'Data export features verified');
            return true;
        },
        fix: (content) => {
            if (!content.includes('exportData')) {
                content += `
// Export data functions
async function exportData(format = 'json') {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const data = await getUserData(user.uid);
        
        switch (format.toLowerCase()) {
            case 'csv':
                return toCSV(data);
            case 'json':
            default:
                return toJSON(data);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
    }
}

function toCSV(data) {
    // Implementation
}

function toJSON(data) {
    return JSON.stringify(data, null, 2);
}`;
            }
            return content;
        }
    }
};

// Run Tests
async function runTests() {
    console.log('=== Running Feature Tests ===\n');

    for (const [key, test] of Object.entries(featureTests)) {
        console.log(`\nTesting ${test.name}...`);
        const passed = test.run();
        
        if (!passed && test.fix) {
            console.log(`Attempting to fix ${test.name}...`);
            const file = key === 'testPWA' ? 'manifest.json' : 
                        `assets/js/${key.replace('test', '').toLowerCase()}.js`;
            
            if (fs.existsSync(file)) {
                applyFix(file, test.fix);
            }
        }
    }

    // Generate Report
    console.log('\n=== Test Report ===');
    console.log(`\nPassed: ${results.passed.length}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Fixes Applied: ${results.fixes.length}`);

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

    if (results.fixes.length > 0) {
        console.log('\nFixes Applied:');
        results.fixes.forEach(fix => {
            console.log(`- ${fix.message}`);
        });
    }

    // Exit with appropriate code
    process.exit(results.errors.length > 0 ? 1 : 0);
}

// Run the tests
runTests(); 