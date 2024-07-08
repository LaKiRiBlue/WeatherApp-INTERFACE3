// Selecting DOM elements
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const weatherIcon = document.querySelector("#weatherIcon");
const windSpeed = document.querySelector("#windSpeed");
const humidity = document.querySelector(".humidity");
const weather = document.querySelector(".weather");
const desc = document.querySelector(".desc");
const dayName = document.getElementById("day-name");
const dateElement = document.getElementById("date");
const hourlyWeatherContainer = document.getElementById("hourlyWeatherContainer");
const dailyWeatherContainer = document.getElementById("dailyWeatherContainer");
const localTimeElement = document.getElementById("local-time");

// API Key for OpenWeatherMap
import { API_KEY } from '../config.js'; // Adjust the path as needed

// Variable to store interval ID
let timeIntervalId;

// Function to get the current day name (e.g., Monday)
const getCurrentDayName = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    return daysOfWeek[dayOfWeek];
};

// Function to set weather details based on API response
const setWeatherDetails = (data) => {
    // Update other weather details as before
    desc.textContent = data.weather[0].description;
    weather.textContent = `${Math.round(data.main.temp - 273.15)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;

    // Set weather icon dynamically based on API response
    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    weatherIcon.src = iconUrl;

    // Calculate timezone offset in seconds
    const timezoneOffset = data.timezone;

    // Update local time based on timezone offset
    displayLocalTime(timezoneOffset);

    // Update date in mainContainer
    displayDate();

    // Fetch hourly weather based on the city's name and timezone offset
    fetchHourlyWeather(data.name, timezoneOffset);
};

// Function to convert UTC timestamp to local time based on timezone offset
const convertUTCToLocalTime = (timezoneOffsetSeconds) => {
    // Get current UTC time in milliseconds
    const now = new Date();
    const utcMilliseconds = now.getTime() + now.getTimezoneOffset() * 60000;

    // Convert timezone offset from seconds to milliseconds
    const timezoneOffsetMilliseconds = timezoneOffsetSeconds * 1000;

    // Calculate local time in milliseconds
    const localTimeMilliseconds = utcMilliseconds + timezoneOffsetMilliseconds;

    // Create a new Date object for the local time
    const localDate = new Date(localTimeMilliseconds);

    // Return the formatted local time string
    return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// Function to display local time based on timezone offset
const displayLocalTime = (timezoneOffset) => {
    const updateTime = () => {
        const localTime = convertUTCToLocalTime(timezoneOffset);
        localTimeElement.textContent = `Local Time: ${localTime}`;
    };

    if (timeIntervalId) {
        clearInterval(timeIntervalId); // Clear the previous interval
    }

    timeIntervalId = setInterval(updateTime, 1000); // Update time every second
    updateTime(); // Initial call to display time immediately
};

// Function to fetch weather data from OpenWeatherMap API
const callWeatherAPI = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found. Please check the spelling and try again.");
            }
            return response.json();
        })
        .then(data => {
            setWeatherDetails(data);
            fetchCityCoordinates(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error.message);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Failed to fetch weather data. Please try again later.';
            // Display error message in your UI
            document.body.appendChild(errorMessage);
        });
};


// Function to fetch hourly weather
const fetchHourlyWeather = (city) => {
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

// Function to display hourly weather
const displayHourlyWeather = (data) => {
    const hourlyData = data.list.slice(0, 12); // Get data for the next 12 hours
    hourlyWeatherContainer.innerHTML = ""; // Clear previous content

    // Get the city's timezone offset in seconds
    const timezoneOffset = data.city.timezone;

    // Get the current UTC time in milliseconds
    const currentUTCTime = new Date().getTime();

    // Calculate the city's current local time in milliseconds
    const cityCurrentTime = currentUTCTime + timezoneOffset * 1000;

    // Calculate the time of the next whole hour in the city's local time
    const nextWholeHour = new Date(cityCurrentTime);
    nextWholeHour.setMinutes(0, 0, 0);
    nextWholeHour.setHours(nextWholeHour.getHours() + 1);

    hourlyData.forEach(hour => {
        const cardTime = new Date((hour.dt + timezoneOffset) * 1000);
        // Check if the card time is at or after the next whole hour
        if (cardTime >= nextWholeHour) {
            const card = document.createElement("div");
            card.classList.add("hourlyCard");

            card.innerHTML = `
                <div class="hour">${formatTime(hour.dt, timezoneOffset)}</div>
                <div class="temperature">${Math.round(hour.main.temp - 273.15)}°C</div>
                <div class="chanceOfRain">☔ ${Math.round(hour.pop * 100)}%</div>
                <div class="weatherDescription">${hour.weather[0].description}</div>
                <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}" class="weatherIcon">
            `;

            hourlyWeatherContainer.appendChild(card);
            nextWholeHour.setHours(nextWholeHour.getHours() + 1); // Increment nextWholeHour by 1 hour
        }
    });
};


const formatTime = (timestamp, timezoneOffset) => {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

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

// Function to display daily weather
const displayDailyWeather = (data) => {
    const dailyData = data.daily.slice(0, 7); // Get data for the next 7 days
    dailyWeatherContainer.innerHTML = ""; // Clear previous content

    dailyData.forEach(day => {
        const card = document.createElement("div");
        card.classList.add("dailyCard");

        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        card.innerHTML = `
            <div class="day">${dayName}</div>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="weatherIcon">
            <div class="weatherDescription">${day.weather[0].description}</div>
            <div class="temperature">
                <span class="max">${Math.round(day.temp.max - 273.15)}°C</span> /
                <span class="min">${Math.round(day.temp.min - 273.15)}°C</span>
            </div>
        `;

        dailyWeatherContainer.appendChild(card);
    });
};

// Function to fetch city coordinates for weather display
const fetchCityCoordinates = (city) => {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error(`Coordinates for ${city} not found. Please try again.`);
            }
            const cityInfo = { lat: data[0].lat, lon: data[0].lon };

            // Update Leaflet map's center to city coordinates
            map.setView([cityInfo.lat, cityInfo.lon], 10); // Adjust zoom level as needed

            fetchDailyWeather(cityInfo); // Fetch and display daily weather
            fetchHourlyWeather(city); // Fetch and display hourly weather
        })
        .catch(error => console.error('Error fetching city coordinates:', error));
};

// Function to display current date
const displayDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    dateElement.textContent = `${month} ${day}`;
};

// Event listener for search button click
searchButton.addEventListener("click", () => {
    const cityName = searchInput.value.trim();
    if (cityName === "") {
        alert("Please enter a city name.");
    } else {
        callWeatherAPI(cityName);
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const cityName = searchInput.value.trim();
        if (cityName === "") {
            alert("Please enter a city name.");
        } else {
            callWeatherAPI(cityName);
        }
    }
});


// Function to initialize the page with default city (Brussels) weather
const initializeWeather = () => {
    callWeatherAPI("Brussels"); // Replace with your default city
    dayName.textContent = getCurrentDayName();
    displayDate(); // Display current date
};

// Initialize weather data on page load
document.addEventListener("DOMContentLoaded", initializeWeather);

// Initialize Leaflet map
const map = L.map('map').setView([51.505, -0.09], 5); // Adjust zoom level to show a larger area

// Add OpenStreetMap tile layer as the base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch and display OpenWeatherMap weather map tiles
const weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);
