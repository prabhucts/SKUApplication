// Frontend Testing Script
// Copy and paste this into the browser console at http://localhost:4200

console.log("Starting SKU Management System Frontend Tests...");

// Test 1: Check if Angular is loaded
function testAngularLoaded() {
    console.log("1. Testing if Angular is loaded...");
    if (typeof ng !== 'undefined') {
        console.log("✅ Angular is loaded");
        return true;
    } else {
        console.log("❌ Angular not detected");
        return false;
    }
}

// Test 2: Test navigation
function testNavigation() {
    console.log("2. Testing navigation...");
    const navLinks = document.querySelectorAll('[routerLink]');
    console.log(`Found ${navLinks.length} navigation links`);
    navLinks.forEach((link, index) => {
        const routerLink = link.getAttribute('routerLink');
        console.log(`  Link ${index + 1}: ${routerLink}`);
    });
}

// Test 3: Test API service
function testAPIConnection() {
    console.log("3. Testing API connection...");
    fetch('http://localhost:5000/api/skus')
        .then(response => {
            if (response.ok) {
                console.log("✅ Backend API is accessible");
                return response.json();
            } else {
                console.log(`❌ API returned status: ${response.status}`);
                throw new Error(`HTTP ${response.status}`);
            }
        })
        .then(data => {
            console.log(`✅ Found ${data.length} SKUs in database`);
            if (data.length > 0) {
                console.log(`First SKU: ${data[0].name} by ${data[0].manufacturer}`);
            }
        })
        .catch(error => {
            console.log(`❌ API connection failed: ${error.message}`);
        });
}

// Test 4: Check if components are loaded
function testComponents() {
    console.log("4. Testing if components are available...");
    const components = ['sku-new', 'sku-search', 'sku-delete'];
    components.forEach(component => {
        const exists = document.querySelector(component) !== null;
        console.log(`  ${component}: ${exists ? '✅ Found' : '❌ Not found'}`);
    });
}

// Test 5: Test form functionality (if on new SKU page)
function testNewSKUForm() {
    console.log("5. Testing New SKU form...");
    const form = document.querySelector('form');
    if (form) {
        const inputs = form.querySelectorAll('input');
        console.log(`✅ Found form with ${inputs.length} input fields`);
        inputs.forEach((input, index) => {
            const name = input.getAttribute('name') || input.getAttribute('placeholder') || 'unnamed';
            console.log(`  Input ${index + 1}: ${name}`);
        });
    } else {
        console.log("❌ No form found (might not be on new SKU page)");
    }
}

// Run all tests
function runAllTests() {
    console.log("🧪 SKU Management System Frontend Test Suite");
    console.log("=============================================");
    
    testAngularLoaded();
    testNavigation();
    testAPIConnection();
    testComponents();
    testNewSKUForm();
    
    console.log("=============================================");
    console.log("Tests completed. Check results above.");
}

// Auto-run tests
runAllTests();

// Export test functions for manual use
window.skuTests = {
    runAll: runAllTests,
    testAngular: testAngularLoaded,
    testNav: testNavigation,
    testAPI: testAPIConnection,
    testComponents: testComponents,
    testForm: testNewSKUForm
};
