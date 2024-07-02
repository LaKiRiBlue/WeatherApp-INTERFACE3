// homePage.js

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

// API Key for OpenWeatherMap
import { API_KEY } from '../config.js';

// Function to set weather details based on API response
const setWeatherDetails = (data) => {
    desc.textContent = data.weather[0].description;
    weather.textContent = `${Math.round(data.main.temp - 273.15)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;

    switch (data.weather[0].main) {
        case 'Clouds':
            weatherIcon.src = "../images/Clouds.png";
            break;
        case 'Clear':
            weatherIcon.src = "../images/sun.png";
            break;
        case 'Rain':
            weatherIcon.src = "../images/rainy.png";
            break;
        case 'Mist':
            weatherIcon.src = "../images/mist.png";
            break;
        case 'Snow':
            weatherIcon.src = "../images/snow.png";
            break;
        case 'Haze':
            weatherIcon.src = "../images/haze.png";
            break;
        default:
            weatherIcon.src = ""; // Handle default case if necessary
            break;
    }
};

// Function to fetch weather data from OpenWeatherMap API
const callWeatherAPI = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                alert("City not found. Please check the spelling and try again.");
                throw new Error(`Request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            setWeatherDetails(data);
            fetchCityCoordinates(city);
        })
        .catch(error => console.error('Error fetching weather data:', error));
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

// Function to fetch daily weather
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

// Fetch coordinates for the city and then get daily and hourly weather
const fetchCityCoordinates = (city) => {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error(`Coordinates for ${city} not found. Please try again.`);
            }
            const cityInfo = { lat: data[0].lat, lon: data[0].lon };
            fetchDailyWeather(cityInfo);
            fetchHourlyWeather(city);
        })
        .catch(error => console.error('Error fetching city coordinates:', error));
};

// Function to get the current day name (e.g., Monday)
const getCurrentDayName = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    return daysOfWeek[dayOfWeek];
};

// Function to get the current date in format "Friday 28"
const getCurrentDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    return `${month} ${day}`;
};

// Event listener for search button click
searchButton.addEventListener("click", () => {
    const cityName = searchInput.value.trim();
    if (cityName === "") {
        alert("Please enter a city name.");
    } else {
        callWeatherAPI(cityName);
        fetchCityCoordinates(cityName);
    }
});

// Event listener for Enter key press in search input
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const cityName = searchInput.value.trim();
        if (cityName === "") {
            alert("Please enter a city name.");
        } else {
            callWeatherAPI(cityName);
            fetchCityCoordinates(cityName);
        }
    }
});

// Function to initialize the page with default city (Brussels) weather
const initializeWeather = () => {
    callWeatherAPI("Brussels"); // Replace with your default city
    fetchCityCoordinates("Brussels"); // Fetch both daily and hourly weather
    dayName.textContent = getCurrentDayName();
    dateElement.textContent = getCurrentDate();
};

// Initialize weather data on page load
document.addEventListener("DOMContentLoaded", initializeWeather);
