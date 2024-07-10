// dailyWeather.js

import { API_KEY } from '../config.js';
const dailyWeatherContainer = document.getElementById("dailyWeatherContainer");

const fetchDailyWeather = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.lat}&lon=${city.lon}&exclude=hourly,minutely&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Weather data for ${city} not found. Please try again.`);
            }
            return response.json();
        })
        .then(data => {
            displayDailyWeather(data);
        })
        .catch(error => console.error('Error fetching daily weather data:', error));
};

const displayDailyWeather = (data) => {
    const dailyData = data.daily.slice(0, 7); 
    dailyWeatherContainer.innerHTML = ""; 

    dailyData.forEach(day => {
        const card = document.createElement("div");
        card.classList.add("dailyCard");

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        card.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="weatherIcon">
            <div class="weatherDescription">${day.weather[0].description}</div>
            <div class="temperature">
                <span class="max">${Math.round(day.temp.max - 273.15)}°C</span> /
                <span class="min">${Math.round(day.temp.min - 273.15)}°C</span>
            </div>
        `;

        dailyWeatherContainer.appendChild(card);
    });
};

// Fetch coordinates for the city and then get daily weather
const fetchCityCoordinates = (city) => {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error(`Coordinates for ${city} not found. Please try again.`);
            }
            const cityInfo = { lat: data[0].lat, lon: data[0].lon };
            fetchDailyWeather(cityInfo);
        })
        .catch(error => console.error('Error fetching city coordinates:', error));
};


fetchCityCoordinates("Brussels"); 
