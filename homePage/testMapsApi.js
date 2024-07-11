// testMapsApi.js

const apiKey = '8cf5ac5621c8d0266298a149e49d7514';
const apiUrl = `http://tile.openweathermap.org/map/temp_new/10/10/10.png?appid=${apiKey}`;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  })
  .then(imageBlob => {
    const imageUrl = URL.createObjectURL(imageBlob);
    console.log('Map image URL:', imageUrl);
  })
  .catch(error => {
    console.error('Error fetching map image:', error);
  });
