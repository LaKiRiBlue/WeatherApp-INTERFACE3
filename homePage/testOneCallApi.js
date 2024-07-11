// testOneCallApi.js

const apiKey = '8cf5ac5621c8d0266298a149e49d7514';
const lat = 51.5085; // Latitude for London
const lon = -0.1257; // Longitude for London
const apiUrl = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}`;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('One Call API data:', data);
  })
  .catch(error => {
    console.error('Error fetching One Call API data:', error);
  });
