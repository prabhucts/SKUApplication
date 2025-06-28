// Quick Frontend Test - Paste this in browser console at http://localhost:4200
console.log("🧪 SKU Management System - Quick Test");
console.log("====================================");

// Test 1: Check current page
console.log("1. Current URL:", window.location.href);
console.log("2. Current path:", window.location.pathname);

// Test 2: Check if Angular router is working
const routerOutlet = document.querySelector('router-outlet');
console.log("3. Router outlet found:", routerOutlet ? "✅ Yes" : "❌ No");

// Test 3: Check for mat-toolbar (should be visible now)
const toolbar = document.querySelector('mat-toolbar');
console.log("4. Material toolbar found:", toolbar ? "✅ Yes" : "❌ No");
if (toolbar) {
    console.log("   Toolbar text:", toolbar.textContent?.trim());
}

// Test 4: Check for navigation menu
const navLinks = document.querySelectorAll('[routerLink]');
console.log("5. Navigation links found:", navLinks.length);
navLinks.forEach((link, index) => {
    const route = link.getAttribute('routerLink');
    const text = link.textContent?.trim();
    console.log(`   Link ${index + 1}: ${route} (${text})`);
});

// Test 5: Check for sidenav
const sidenav = document.querySelector('mat-sidenav');
console.log("6. Material sidenav found:", sidenav ? "✅ Yes" : "❌ No");

// Test 6: Check for main content area
const sidenavContent = document.querySelector('mat-sidenav-content');
console.log("7. Sidenav content area found:", sidenavContent ? "✅ Yes" : "❌ No");

// Test 7: Check for current route content
const currentContent = document.querySelector('mat-sidenav-content router-outlet');
console.log("8. Route content area found:", currentContent ? "✅ Yes" : "❌ No");

// Test 8: Check for any forms (if on new SKU page)
const forms = document.querySelectorAll('form');
console.log("9. Forms found:", forms.length);

// Test 9: Check for any tables (if on search/delete page)
const tables = document.querySelectorAll('table[mat-table]');
console.log("10. Material tables found:", tables.length);

// Test 10: Test backend API
console.log("11. Testing backend API...");
fetch('http://localhost:5000/api/skus')
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(`HTTP ${response.status}`);
    })
    .then(data => {
        console.log("    ✅ Backend API working - Found", data.length, "SKUs");
        if (data.length > 0) {
            console.log("    Sample SKU:", data[0].name, "by", data[0].manufacturer);
        }
    })
    .catch(error => {
        console.log("    ❌ Backend API error:", error.message);
        console.log("    💡 You may need to start the backend server");
    });

// Test navigation functions
window.testNav = {
    new: () => window.location.href = '/new',
    search: () => window.location.href = '/search', 
    delete: () => window.location.href = '/delete'
};

console.log("====================================");
console.log("✅ Frontend test completed!");
console.log("💡 Use testNav.new(), testNav.search(), testNav.delete() to navigate");
console.log("🔧 If backend API failed, run: cd backend && python3 main.py");
