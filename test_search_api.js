// Test script to verify the SKU search functionality
console.log('Testing SKU search API...');

// Function to fetch all SKUs
async function fetchAllSKUs() {
  console.log('Fetching all SKUs...');
  
  try {
    const response = await fetch('http://localhost:5000/api/skus');
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.items.length} SKUs out of total ${data.total}`);
    
    // Print the first few SKUs
    if (data.items.length > 0) {
      console.log('First 3 SKUs:');
      data.items.slice(0, 3).forEach((sku, index) => {
        console.log(`${index + 1}. ${sku.name} (${sku.ndc}) - Status: ${sku.status}`);
      });
    } else {
      console.log('No SKUs found!');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    return null;
  }
}

// Function to search SKUs by name
async function searchSKUsByName(name) {
  console.log(`Searching for SKUs with name containing "${name}"...`);
  
  try {
    const response = await fetch(`http://localhost:5000/api/skus?name=${encodeURIComponent(name)}`);
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`Found ${data.items.length} SKUs matching "${name}"`);
    
    // Print matching SKUs
    if (data.items.length > 0) {
      console.log('Matching SKUs:');
      data.items.forEach((sku, index) => {
        console.log(`${index + 1}. ${sku.name} (${sku.ndc}) - Status: ${sku.status}`);
      });
    } else {
      console.log('No matching SKUs found!');
    }
    
    return data;
  } catch (error) {
    console.error('Error searching SKUs:', error);
    return null;
  }
}

// Execute tests
async function runTests() {
  console.log('----- Testing All SKUs Query -----');
  const allSKUs = await fetchAllSKUs();
  
  console.log('\n----- Testing Search by Name -----');
  await searchSKUsByName('Aspirin');
  
  console.log('\n----- Testing Search with Non-existent Name -----');
  await searchSKUsByName('NonexistentDrugXYZ');
  
  console.log('\nTests completed!');
}

// Run the tests
runTests();
