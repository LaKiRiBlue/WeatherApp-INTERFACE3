// testApiKey.js

const apiKey = '8cf5ac5621c8d0266298a149e49d7514';
const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Weather data:', data);
  })
  .catch(error => {
    console.error('Error fetching weather data:', error);
  });
