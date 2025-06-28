// SKU Management System - Application Test
// Run this in the browser console at http://localhost:4200

console.log("🧪 Testing SKU Management System");
console.log("================================");

// Test 1: Check if we're on the right page
console.log("1. Current URL:", window.location.href);

// Test 2: Check if Angular is loaded
const angularLoaded = typeof ng !== 'undefined';
console.log("2. Angular loaded:", angularLoaded ? "✅ Yes" : "❌ No");

// Test 3: Check navigation elements
const navLinks = document.querySelectorAll('[routerLink]');
console.log("3. Navigation links found:", navLinks.length);
navLinks.forEach((link, index) => {
    const route = link.getAttribute('routerLink');
    console.log(`   Link ${index + 1}: ${route}`);
});

// Test 4: Check if router-outlet exists
const routerOutlet = document.querySelector('router-outlet');
console.log("4. Router outlet found:", routerOutlet ? "✅ Yes" : "❌ No");

// Test 5: Check current route content
const currentPath = window.location.pathname;
console.log("5. Current route:", currentPath);

// Test 6: Check for forms (if on new SKU page)
const forms = document.querySelectorAll('form');
console.log("6. Forms found:", forms.length);

// Test 7: Check for tables (if on search/delete page)
const tables = document.querySelectorAll('table[mat-table]');
console.log("7. Material tables found:", tables.length);

// Test 8: Check for mat-cards
const cards = document.querySelectorAll('mat-card');
console.log("8. Material cards found:", cards.length);

// Test 9: Test backend connectivity
console.log("9. Testing backend API...");
fetch('http://localhost:5000/api/skus')
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(`HTTP ${response.status}`);
    })
    .then(data => {
        console.log("   ✅ Backend API working - Found", data.length, "SKUs");
        if (data.length > 0) {
            console.log("   First SKU:", data[0].name, "by", data[0].manufacturer);
        }
    })
    .catch(error => {
        console.log("   ❌ Backend API error:", error.message);
    });

// Test 10: Navigation test functions
console.log("10. Creating navigation test functions...");
window.testNavigation = {
    goToNew: () => {
        window.location.href = '/new';
        console.log("Navigated to New SKU page");
    },
    goToSearch: () => {
        window.location.href = '/search';
        console.log("Navigated to Search page");
    },
    goToDelete: () => {
        window.location.href = '/delete';
        console.log("Navigated to Delete page");
    }
};

console.log("================================");
console.log("✅ Test completed!");
console.log("💡 Use testNavigation.goToNew(), testNavigation.goToSearch(), or testNavigation.goToDelete() to navigate");
console.log("🔍 Check the network tab to see API calls");
