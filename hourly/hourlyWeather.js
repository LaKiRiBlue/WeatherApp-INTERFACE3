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
    const hourlyData = data.list.slice(0, 12); // Get data for the next 12 hours
    const hourlyWeatherContainer = document.getElementById("hourlyWeatherContainer");
    hourlyWeatherContainer.innerHTML = ""; // Clear previous content

    hourlyData.forEach(hour => {
        const card = document.createElement("div");
        card.classList.add("hourlyCard");

        card.innerHTML = `
            <div class="hour">${formatTime(hour.dt)}</div>
            <div class="temperature">${Math.round(hour.main.temp - 273.15)}°C</div>
            <div class="chanceOfRain">Rain ${Math.round(hour.pop * 100)}%</div>
            <div class="weatherDescription">${hour.weather[0].description}</div>
        `;

        hourlyWeatherContainer.appendChild(card);
    });
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
