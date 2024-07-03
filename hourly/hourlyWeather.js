// hourlyWeather.js
import { API_KEY } from '../config.js';

export const fetchHourlyWeather = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather data for ${city} not found. Please try again.`);
            }
            return response.json();
        })
        .then(data => {
            displayHourlyWeather(data);
        })
        .catch(error => console.error('Error fetching hourly weather data:', error));
};

const displayHourlyWeather = (data) => {
    const hourlyData = data.list; // Get all hourly data
    const currentTimestamp = Date.now() / 1000; // Current timestamp in seconds
    const currentHour = new Date(currentTimestamp * 1000).getHours(); // Current hour
    let startIndex = 0;

    // Find the index of the next whole hour in the data
    for (let i = 0; i < hourlyData.length; i++) {
        const hourTimestamp = hourlyData[i].dt;
        const hour = new Date(hourTimestamp * 1000).getHours();
        
        if (hour > currentHour) {
            startIndex = i;
            break;
        }
    }

    const hourlyWeatherContainer = document.getElementById("hourlyWeatherContainer");
    hourlyWeatherContainer.innerHTML = ""; // Clear previous content

    // Display the hourly weather starting from the next whole hour
    for (let i = startIndex; i < startIndex + 12; i++) {
        const hour = hourlyData[i];
        if (!hour) break; // Stop if no more data available

        const card = document.createElement("div");
        card.classList.add("hourlyCard");

        card.innerHTML = `
            <div class="hour">${formatTime(hour.dt)}</div>
            <div class="temperature">${Math.round(hour.main.temp - 273.15)}°C</div>
            <div class="chanceOfRain">Rain ${Math.round(hour.pop * 100)}%</div>
            <div class="weatherDescription">${hour.weather[0].description}</div>
        `;

        hourlyWeatherContainer.appendChild(card);
    }
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
