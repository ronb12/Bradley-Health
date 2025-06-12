const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  directories: [
    'assets',
    'insights',
    'medication-management',
    'scripts'
  ],
  fileTypes: ['.js', '.css', '.html'],
  maxFileSize: 1024 * 1024, // 1MB
  requiredFiles: [
    'assets/style.css',
    'assets/mobile.css',
    'assets/shared.js',
    'assets/js/charts.js',
    'assets/js/export.js',
    'assets/js/insights.js',
    'assets/js/medication-reminder.js'
  ]
};

// Error types to check for
const errorChecks = {
  missingFiles: [],
  syntaxErrors: [],
  styleIssues: [],
  accessibilityIssues: [],
  performanceIssues: []
};

// Check for missing files
function checkMissingFiles() {
  console.log('Checking for missing files...');
  config.requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      errorChecks.missingFiles.push(file);
    }
  });
}

// Check for syntax errors
function checkSyntaxErrors() {
  console.log('Checking for syntax errors...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    errorChecks.syntaxErrors.push('Linting errors found');
  }
}

// Check for style issues
function checkStyleIssues() {
  console.log('Checking for style issues...');
  try {
    execSync('npm run stylelint', { stdio: 'inherit' });
  } catch (error) {
    errorChecks.styleIssues.push('Stylelint errors found');
  }
}

// Fix style issues
function fixStyleIssues() {
  console.log('Fixing style issues...');
  try {
    execSync('npm run stylelint:fix', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error fixing style issues:', error.message);
  }
}

// Check file sizes
function checkFileSizes() {
  console.log('Checking file sizes...');
  config.directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.size > config.maxFileSize) {
          errorChecks.performanceIssues.push(`${filePath} is too large (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        }
      });
    }
  });
}

// Check for accessibility issues
function checkAccessibility() {
  console.log('Checking for accessibility issues...');
  try {
    execSync('npm run a11y', { stdio: 'inherit' });
  } catch (error) {
    errorChecks.accessibilityIssues.push('Accessibility issues found');
  }
}

// Fix common issues
function fixCommonIssues() {
  console.log('Fixing common issues...');
  
  // Fix line endings
  try {
    execSync('git config core.autocrlf input', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "fix: Normalize line endings"', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error fixing line endings:', error.message);
  }

  // Fix file permissions
  try {
    execSync('chmod -R 644 .', { stdio: 'inherit' });
    execSync('chmod -R +X .', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error fixing file permissions:', error.message);
  }
}

// Main function
async function main() {
  console.log('Starting error check and fix process...\n');

  // Run checks
  checkMissingFiles();
  checkSyntaxErrors();
  checkStyleIssues();
  checkFileSizes();
  checkAccessibility();

  // Fix issues
  fixStyleIssues();
  fixCommonIssues();

  // Report results
  console.log('\nError Check Results:');
  console.log('===================');
  
  Object.entries(errorChecks).forEach(([check, issues]) => {
    if (issues.length > 0) {
      console.log(`\n${check}:`);
      issues.forEach(issue => console.log(`- ${issue}`));
    }
  });

  // Summary
  const totalIssues = Object.values(errorChecks).reduce((sum, issues) => sum + issues.length, 0);
  console.log(`\nTotal issues found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ No issues found!');
  } else {
    console.log('\n⚠️ Some issues were found and fixed where possible.');
  }
}

// Run the script
main().catch(error => {
  console.error('Error running fix script:', error);
  process.exit(1);
}); 