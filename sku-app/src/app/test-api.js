// This is a simple test component to verify API connectivity
// with direct fetch calls to ensure the API returns correctly

fetch('http://localhost:5000/api/skus')
  .then(response => {
    console.log('Raw API response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('ALL SKUs direct fetch data:', data);
  })
  .catch(err => {
    console.error('Direct API fetch error:', err);
  });

// Search with a specific term
fetch('http://localhost:5000/api/skus?name=Aspirin')
  .then(response => {
    console.log('Raw SEARCH API response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Search SKUs direct fetch data:', data);
  })
  .catch(err => {
    console.error('Direct API search fetch error:', err);
  });
