#!/usr/bin/env node

console.log('Testing ChatBot SKU Commands...');

// Test NDC codes
const testNdcCodes = [
    '11111-222-33',    // This exists in the DB 
    '1111-222-33',     // This is a variation of the correct code
    '98765-432-10',    // Another format in the DB
    'nonexistent-123'  // This doesn't exist
];

// Fetch the data for each NDC code
async function testFindSku(ndc) {
    console.log(`\nTesting NDC code: ${ndc}`);
    
    try {
        const response = await fetch(`http://localhost:5000/api/skus?ndc=${encodeURIComponent(ndc)}`);
        
        if (!response.ok) {
            console.log(`Error searching for NDC ${ndc}: ${response.status}`);
            return;
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            console.log(`Found ${data.items.length} SKUs for NDC ${ndc}:`);
            data.items.forEach((sku, index) => {
                console.log(`${index + 1}. NDC: ${sku.ndc}, Name: ${sku.name}, Status: ${sku.status}`);
            });
        } else {
            console.log(`No SKUs found for NDC ${ndc}`);
            
            // Try a direct search as a fallback
            const directResponse = await fetch(`http://localhost:5000/api/skus/${ndc}`);
            if (directResponse.ok) {
                const sku = await directResponse.json();
                console.log(`Direct lookup found: NDC: ${sku.ndc}, Name: ${sku.name}, Status: ${sku.status}`);
            } else {
                console.log(`Direct lookup also failed: ${directResponse.status}`);
            }
        }
    } catch (error) {
        console.error(`Error testing NDC ${ndc}:`, error.message);
    }
}

// Test search terms
async function testSearch(searchTerm) {
    console.log(`\nTesting search term: "${searchTerm}"`);
    
    try {
        const response = await fetch(`http://localhost:5000/api/skus?name=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            console.log(`Error searching for "${searchTerm}": ${response.status}`);
            return;
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            console.log(`Found ${data.items.length} SKUs for "${searchTerm}":`);
            data.items.forEach((sku, index) => {
                console.log(`${index + 1}. NDC: ${sku.ndc}, Name: ${sku.name}, Status: ${sku.status}`);
            });
        } else {
            console.log(`No SKUs found for search term "${searchTerm}"`);
        }
    } catch (error) {
        console.error(`Error testing search term "${searchTerm}":`, error.message);
    }
}

// Run all the tests
async function runTests() {
    console.log('Testing NDC lookups...');
    for (const ndc of testNdcCodes) {
        await testFindSku(ndc);
    }
    
    console.log('\nTesting search terms...');
    await testSearch('Aspirin');
    await testSearch('aspirin');  // Test case insensitivity
    await testSearch('non-existent-drug');
    
    console.log('\nTests completed!');
}

// Run the tests
runTests();
