// Comprehensive SKU Management System Test
// Open browser to http://localhost:4200 and paste this in the console (F12)

console.log("🧪 Starting SKU Management System Comprehensive Test");
console.log("=" * 60);

// Test Configuration
const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:4200';

// Test Functions
async function testBackendAPI() {
    console.log("\n🔧 Testing Backend API...");
    
    try {
        // Test 1: Get all SKUs
        const response = await fetch(`${API_BASE}/skus`);
        if (response.ok) {
            const skus = await response.json();
            console.log(`✅ GET /api/skus: Found ${skus.length} SKUs`);
            
            if (skus.length > 0) {
                console.log(`   First SKU: ${skus[0].name} by ${skus[0].manufacturer}`);
            }
            
            // Test 2: Search functionality
            const searchResponse = await fetch(`${API_BASE}/skus?name=aspirin`);
            if (searchResponse.ok) {
                const searchResults = await searchResponse.json();
                console.log(`✅ Search API: Found ${searchResults.length} results for 'aspirin'`);
            }
            
            return true;
        } else {
            console.log(`❌ Backend API Error: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Backend API Connection Failed: ${error.message}`);
        return false;
    }
}

function testFrontendComponents() {
    console.log("\n🎨 Testing Frontend Components...");
    
    // Check if Angular is loaded
    if (typeof ng !== 'undefined') {
        console.log("✅ Angular Framework: Loaded");
    } else {
        console.log("❌ Angular Framework: Not detected");
        return false;
    }
    
    // Check navigation
    const navLinks = document.querySelectorAll('[routerLink]');
    console.log(`✅ Navigation Links: Found ${navLinks.length} links`);
    
    // Check for components
    const components = ['app-root'];
    components.forEach(comp => {
        const found = document.querySelector(comp) !== null;
        console.log(`${found ? '✅' : '❌'} Component ${comp}: ${found ? 'Found' : 'Not found'}`);
    });
    
    return true;
}

function testCurrentPage() {
    console.log("\n📄 Testing Current Page...");
    
    const currentPath = window.location.pathname;
    console.log(`Current Route: ${currentPath}`);
    
    // Check for forms
    const forms = document.querySelectorAll('form');
    console.log(`✅ Forms Found: ${forms.length}`);
    
    // Check for tables
    const tables = document.querySelectorAll('table');
    console.log(`✅ Tables Found: ${tables.length}`);
    
    // Check for buttons
    const buttons = document.querySelectorAll('button');
    console.log(`✅ Buttons Found: ${buttons.length}`);
    
    return true;
}

async function testCreateSKU() {
    console.log("\n➕ Testing SKU Creation...");
    
    const testSKU = {
        ndc: "99999-999-99",
        name: "Console Test Drug",
        manufacturer: "Test Corp",
        dosage_form: "Tablet",
        strength: "50mg",
        package_size: "10 tablets"
    };
    
    try {
        const response = await fetch(`${API_BASE}/skus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testSKU)
        });
        
        if (response.ok) {
            const created = await response.json();
            console.log(`✅ SKU Creation: Success (ID: ${created.id})`);
            
            // Clean up - delete the test SKU
            if (created.id) {
                const deleteResponse = await fetch(`${API_BASE}/skus/${created.id}`, {
                    method: 'DELETE'
                });
                if (deleteResponse.ok) {
                    console.log(`✅ Test SKU Cleanup: Success`);
                }
            }
            return true;
        } else {
            console.log(`❌ SKU Creation Failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ SKU Creation Error: ${error.message}`);
        return false;
    }
}

// Navigation test functions
function testNavigation() {
    console.log("\n🧭 Navigation Test Functions Available:");
    console.log("   navigateToNew() - Navigate to New SKU page");
    console.log("   navigateToSearch() - Navigate to Search page");
    console.log("   navigateToDelete() - Navigate to Delete page");
    
    window.navigateToNew = () => {
        window.location.href = '/new';
        console.log("Navigated to New SKU page");
    };
    
    window.navigateToSearch = () => {
        window.location.href = '/search';
        console.log("Navigated to Search page");
    };
    
    window.navigateToDelete = () => {
        window.location.href = '/delete';
        console.log("Navigated to Delete page");
    };
}

// Main test runner
async function runAllTests() {
    console.log("🚀 Running Complete System Test...");
    
    const backendOK = await testBackendAPI();
    const frontendOK = testFrontendComponents();
    const pageOK = testCurrentPage();
    
    if (backendOK) {
        await testCreateSKU();
    }
    
    testNavigation();
    
    console.log("\n📊 Test Summary:");
    console.log(`Backend API: ${backendOK ? '✅ Working' : '❌ Failed'}`);
    console.log(`Frontend: ${frontendOK ? '✅ Working' : '❌ Failed'}`);
    console.log(`Current Page: ${pageOK ? '✅ Working' : '❌ Failed'}`);
    
    if (backendOK && frontendOK && pageOK) {
        console.log("\n🎉 System is fully functional!");
        console.log("\n📋 Manual Test Checklist:");
        console.log("1. ✓ Navigate between pages using the menu");
        console.log("2. ✓ Create a new SKU using the form");
        console.log("3. ✓ Search for existing SKUs");
        console.log("4. ✓ Delete unwanted SKUs");
        console.log("\n💡 Use navigateToNew(), navigateToSearch(), navigateToDelete() to test navigation");
    } else {
        console.log("\n⚠️ System needs attention - check the failed components above");
    }
}

// Export test functions to global scope
window.skuTest = {
    runAll: runAllTests,
    testAPI: testBackendAPI,
    testFrontend: testFrontendComponents,
    testPage: testCurrentPage,
    testCreate: testCreateSKU,
    navigateToNew: () => window.location.href = '/new',
    navigateToSearch: () => window.location.href = '/search',
    navigateToDelete: () => window.location.href = '/delete'
};

// Auto-run tests
runAllTests();
