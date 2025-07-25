// Limb Care Form Automated Test Script
// Run this in the browser console on the main app page

console.log('🧪 Starting Limb Care Form Tests...');

const testResults = [];

function logTest(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const result = `${timestamp}: ${message}`;
    testResults.push(result);
    console.log(`[${type.toUpperCase()}] ${result}`);
}

function runLimbCareTests() {
    console.clear();
    testResults.length = 0;
    
    logTest('Starting comprehensive limb care form tests...', 'info');
    
    // Test 1: Check if limb care manager exists
    testLimbCareManager();
    
    // Test 2: Check form elements
    testFormElements();
    
    // Test 3: Check event listeners
    testEventListeners();
    
    // Test 4: Check form validation
    testFormValidation();
    
    // Test 5: Check prosthetic form specifically
    testProstheticForm();
    
    // Test 6: Check form visibility
    testFormVisibility();
    
    // Test 7: Check dropdown functionality
    testDropdownFunctionality();
    
    // Summary
    logTest('=== TEST SUMMARY ===', 'info');
    testResults.forEach(result => {
        if (result.includes('❌')) {
            logTest(result, 'error');
        } else if (result.includes('✅')) {
            logTest(result, 'success');
        }
    });
}

function testLimbCareManager() {
    logTest('Testing Limb Care Manager...', 'info');
    
    if (window.limbCareManager) {
        logTest('✅ Limb care manager found', 'success');
        
        if (window.limbCareManager.userLimbs) {
            logTest(`User limbs: ${JSON.stringify(window.limbCareManager.userLimbs)}`, 'info');
        }
        
        if (window.limbCareManager.db) {
            logTest('✅ Database connection available', 'success');
        } else {
            logTest('❌ Database connection not available', 'error');
        }
        
        if (window.limbCareManager.currentUser) {
            logTest('✅ User authenticated', 'success');
        } else {
            logTest('⚠️ User not authenticated', 'warning');
        }
    } else {
        logTest('❌ Limb care manager not found', 'error');
    }
}

function testFormElements() {
    logTest('Testing Form Elements...', 'info');
    
    const forms = [
        'limbAssessmentForm',
        'prostheticForm',
        'painForm',
        'reminderForm'
    ];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            logTest(`✅ Form found: ${formId}`, 'success');
            
            // Check submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                logTest(`✅ Submit button found in ${formId}`, 'success');
            } else {
                logTest(`❌ Submit button missing in ${formId}`, 'error');
            }
        } else {
            logTest(`❌ Form missing: ${formId}`, 'error');
        }
    });
    
    // Test prosthetic form elements specifically
    const prostheticElements = [
        'prostheticLimb',
        'prostheticFit',
        'wearTime',
        'cleaningDone',
        'prostheticNotes'
    ];
    
    prostheticElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            logTest(`✅ Element found: ${elementId}`, 'success');
        } else {
            logTest(`❌ Element missing: ${elementId}`, 'error');
        }
    });
}

function testEventListeners() {
    logTest('Testing Event Listeners...', 'info');
    
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
        // Try to trigger a submit event
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        
        // Add a temporary listener to see if it gets triggered
        let eventTriggered = false;
        prostheticForm.addEventListener('submit', () => {
            eventTriggered = true;
            logTest('✅ Form submit event triggered', 'success');
        }, { once: true });
        
        // Trigger the event
        prostheticForm.dispatchEvent(submitEvent);
        
        if (!eventTriggered) {
            logTest('❌ Form submit event not triggered', 'error');
        }
    }
}

function testFormValidation() {
    logTest('Testing Form Validation...', 'info');
    
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
        const requiredFields = prostheticForm.querySelectorAll('[required]');
        logTest(`Found ${requiredFields.length} required fields`, 'info');
        
        requiredFields.forEach(field => {
            logTest(`Required field: ${field.name || field.id}`, 'info');
        });
        
        // Test validation by trying to submit empty form
        const originalSubmit = prostheticForm.onsubmit;
        prostheticForm.onsubmit = null;
        
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const wasPrevented = prostheticForm.dispatchEvent(submitEvent);
        
        if (!wasPrevented) {
            logTest('✅ Form validation working (submission prevented)', 'success');
        } else {
            logTest('❌ Form validation not working (submission not prevented)', 'error');
        }
        
        prostheticForm.onsubmit = originalSubmit;
    }
}

function testProstheticForm() {
    logTest('Testing Prosthetic Form Specifically...', 'info');
    
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
        // Check form display
        const computedStyle = window.getComputedStyle(prostheticForm);
        logTest(`Form display: ${computedStyle.display}`, 'info');
        logTest(`Form visibility: ${computedStyle.visibility}`, 'info');
        
        // Check if form is disabled
        if (prostheticForm.disabled) {
            logTest('❌ Form is disabled', 'error');
        } else {
            logTest('✅ Form is enabled', 'success');
        }
        
        // Check submit button
        const submitBtn = prostheticForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (submitBtn.disabled) {
                logTest('❌ Submit button is disabled', 'error');
            } else {
                logTest('✅ Submit button is enabled', 'success');
            }
            
            // Test button click
            const clickEvent = new Event('click', { bubbles: true });
            submitBtn.dispatchEvent(clickEvent);
        }
    }
}

function testFormVisibility() {
    logTest('Testing Form Visibility...', 'info');
    
    const prostheticForm = document.getElementById('prostheticForm');
    const prostheticSetupMessage = document.getElementById('prostheticSetupMessage');
    
    if (prostheticForm) {
        const formDisplay = window.getComputedStyle(prostheticForm).display;
        logTest(`Prosthetic form display: ${formDisplay}`, 'info');
        
        if (formDisplay === 'none') {
            logTest('❌ Prosthetic form is hidden', 'error');
        } else {
            logTest('✅ Prosthetic form is visible', 'success');
        }
    }
    
    if (prostheticSetupMessage) {
        const messageDisplay = window.getComputedStyle(prostheticSetupMessage).display;
        logTest(`Setup message display: ${messageDisplay}`, 'info');
    }
}

function testDropdownFunctionality() {
    logTest('Testing Dropdown Functionality...', 'info');
    
    const prostheticLimbSelect = document.getElementById('prostheticLimb');
    if (prostheticLimbSelect) {
        logTest(`Dropdown options: ${prostheticLimbSelect.options.length}`, 'info');
        
        // Check if dropdown has options
        if (prostheticLimbSelect.options.length > 1) {
            logTest('✅ Dropdown has options', 'success');
        } else {
            logTest('❌ Dropdown has no options', 'error');
        }
        
        // Check if dropdown is disabled
        if (prostheticLimbSelect.disabled) {
            logTest('❌ Dropdown is disabled', 'error');
        } else {
            logTest('✅ Dropdown is enabled', 'success');
        }
        
        // List all options
        for (let i = 0; i < prostheticLimbSelect.options.length; i++) {
            const option = prostheticLimbSelect.options[i];
            logTest(`Option ${i}: "${option.value}" - "${option.text}"`, 'info');
        }
    }
}

function simulateProstheticFormSubmission() {
    logTest('Simulating Prosthetic Form Submission...', 'info');
    
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
        // Fill in the form
        const prostheticLimb = document.getElementById('prostheticLimb');
        const prostheticFit = document.getElementById('prostheticFit');
        
        if (prostheticLimb && prostheticLimb.options.length > 1) {
            prostheticLimb.value = prostheticLimb.options[1].value;
            logTest(`Set limb value to: ${prostheticLimb.value}`, 'info');
        }
        
        if (prostheticFit && prostheticFit.options.length > 1) {
            prostheticFit.value = prostheticFit.options[1].value;
            logTest(`Set fit value to: ${prostheticFit.value}`, 'info');
        }
        
        // Try to submit
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        prostheticForm.dispatchEvent(submitEvent);
        
        logTest('Form submission attempted', 'info');
    }
}

// Export functions for manual testing
window.limbCareTests = {
    runAll: runLimbCareTests,
    testManager: testLimbCareManager,
    testElements: testFormElements,
    testListeners: testEventListeners,
    testValidation: testFormValidation,
    testProsthetic: testProstheticForm,
    testVisibility: testFormVisibility,
    testDropdown: testDropdownFunctionality,
    simulateSubmission: simulateProstheticFormSubmission
};

console.log('Test functions available. Run: limbCareTests.runAll() to start testing');
console.log('Or run individual tests: limbCareTests.testProsthetic()'); 