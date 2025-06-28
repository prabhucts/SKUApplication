# SKU Management System - Testing Guide

## System Overview
- **Frontend**: Angular application running on http://localhost:4200
- **Backend**: FastAPI server running on http://localhost:5000
- **Database**: SQLite with sample drug SKUs

## Pre-Test Setup
1. Ensure backend is running: `python backend/main.py`
2. Ensure frontend is running: `ng serve` in sku-app directory
3. Open browser to http://localhost:4200

## Manual Test Cases

### Test 1: Application Loading
**Expected Result**: Application loads with navigation menu
- [ ] Page loads without errors
- [ ] Navigation menu shows: New SKU, Search SKUs, Delete SKU
- [ ] Default route redirects to Search page

### Test 2: Navigation Testing
**Expected Result**: All navigation links work
- [ ] Click "New SKU" - navigates to /new
- [ ] Click "Search SKUs" - navigates to /search  
- [ ] Click "Delete SKU" - navigates to /delete
- [ ] Browser back/forward buttons work

### Test 3: Search SKU Functionality
**Expected Result**: Can search and display existing SKUs
- [ ] Search page loads with search form
- [ ] "Load All SKUs" button displays all records
- [ ] Search by name filters results correctly
- [ ] Results display in table format
- [ ] Table shows: NDC, Name, Manufacturer, Dosage Form, Strength, Package Size

### Test 4: New SKU Creation
**Expected Result**: Can create new SKUs
- [ ] New SKU form loads with all required fields
- [ ] Required fields: NDC, Name, Manufacturer, Dosage Form, Strength, Package Size
- [ ] Form validation works (required fields)
- [ ] Submit button creates new SKU
- [ ] Success message appears after creation
- [ ] New SKU appears in search results

### Test 5: Delete SKU Functionality
**Expected Result**: Can delete existing SKUs
- [ ] Delete page loads with search functionality
- [ ] Can search for SKUs to delete
- [ ] Delete button appears for each SKU
- [ ] Confirmation dialog appears before deletion
- [ ] SKU is removed after confirmation
- [ ] Success message appears after deletion

### Test 6: API Integration
**Expected Result**: Frontend communicates with backend properly
- [ ] Network tab shows API calls to localhost:5000
- [ ] GET /api/skus returns SKU list
- [ ] POST /api/skus creates new SKUs
- [ ] DELETE /api/skus/{id} removes SKUs
- [ ] Search queries use proper parameters

### Test 7: Error Handling
**Expected Result**: Application handles errors gracefully
- [ ] Invalid form submissions show error messages
- [ ] Network errors display user-friendly messages
- [ ] Empty search results show appropriate message

## Sample Test Data

### Existing SKUs (should be visible in search):
1. Aspirin 325mg - Bayer
2. Ibuprofen 200mg - Advil
3. Acetaminophen 500mg - Tylenol
4. Lisinopril 10mg - Generic
5. Metformin 500mg - Generic
6. Atorvastatin 20mg - Lipitor
7. Amlodipine 5mg - Generic

### Test SKU for Creation:
- NDC: 12345-678-90
- Name: Test Drug
- Manufacturer: Test Pharma
- Dosage Form: Tablet
- Strength: 100mg
- Package Size: 30 tablets

## Browser Console Tests

Open browser console (F12) at http://localhost:4200 and run:

```javascript
// Test API connection
fetch('http://localhost:5000/api/skus')
  .then(r => r.json())
  .then(data => console.log(`API returned ${data.length} SKUs`))
  .catch(e => console.error('API Error:', e));

// Test Angular components
console.log('Components found:', 
  Array.from(document.querySelectorAll('sku-new, sku-search, sku-delete'))
    .map(el => el.tagName.toLowerCase()));
```

## Expected API Responses

### GET /api/skus
```json
[
  {
    "id": 1,
    "ndc": "0456-1234-01",
    "name": "Aspirin",
    "manufacturer": "Bayer",
    "dosage_form": "Tablet",
    "strength": "325mg",
    "package_size": "100 tablets"
  }
]
```

### POST /api/skus (Create)
- Request: SKU object
- Response: Created SKU with ID

### DELETE /api/skus/{id}
- Response: 200 OK

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Backend should have CORS enabled for localhost:4200
2. **Port Conflicts**: Ensure ports 4200 and 5000 are available
3. **Missing Dependencies**: Run `npm install` in sku-app directory
4. **Database Issues**: Check if sku_database.db exists in backend folder

### Resolution Steps:
1. Check browser console for JavaScript errors
2. Check network tab for failed API calls
3. Verify backend logs for request processing
4. Ensure all Angular dependencies are installed
