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

import { API_KEY } from '../config.js'; 

let timeIntervalId;

const getCurrentDayName = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    return daysOfWeek[dayOfWeek];
};

const setWeatherDetails = (data) => {
    desc.textContent = data.weather[0].description;
    weather.textContent = `${Math.round(data.main.temp - 273.15)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;

    const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    weatherIcon.src = iconUrl;

    const timezoneOffset = data.timezone;
    displayLocalTime(timezoneOffset);
    displayDate();
    fetchHourlyWeather(data.name, timezoneOffset);
};

const convertUTCToLocalTime = (timezoneOffsetSeconds) => {
    const now = new Date();
    const utcMilliseconds = now.getTime() + now.getTimezoneOffset() * 60000;
    const timezoneOffsetMilliseconds = timezoneOffsetSeconds * 1000;
    const localTimeMilliseconds = utcMilliseconds + timezoneOffsetMilliseconds;
    const localDate = new Date(localTimeMilliseconds);
    return localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

const displayLocalTime = (timezoneOffset) => {
    const updateTime = () => {
        const localTime = convertUTCToLocalTime(timezoneOffset);
        localTimeElement.textContent = `Local Time: ${localTime}`;
    };

    if (timeIntervalId) {
        clearInterval(timeIntervalId); 
    }

    timeIntervalId = setInterval(updateTime, 1000); 
    updateTime();
};

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

const displayHourlyWeather = (data) => {
    const hourlyData = data.list.slice(0, 12); 
    hourlyWeatherContainer.innerHTML = ""; 

    const timezoneOffset = data.city.timezone;
    const currentUTCTime = new Date().getTime();
    const cityCurrentTime = currentUTCTime + timezoneOffset * 1000;
    const nextWholeHour = new Date(cityCurrentTime);
    nextWholeHour.setMinutes(0, 0, 0);
    nextWholeHour.setHours(nextWholeHour.getHours() + 1);

    hourlyData.forEach(hour => {
        const cardTime = new Date((hour.dt + timezoneOffset) * 1000);

        if (cardTime >= nextWholeHour) {
            const card = document.createElement("div");
            card.classList.add("hourlyCard");

            card.innerHTML = `
                <div class="hour">${formatTime(hour.dt, timezoneOffset)}</div>
                <div class="temperature">${Math.round(hour.main.temp - 273.15)}°C</div>
                <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}" class="weatherIcon">
                <div class="chanceOfRain">☔ ${Math.round(hour.pop * 100)}%</div>
                <div class="weatherDescription">${hour.weather[0].description}</div>
            `

            hourlyWeatherContainer.appendChild(card);
            nextWholeHour.setHours(nextWholeHour.getHours() + 1); 
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
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="weatherIcon">
            <div class="weatherDescription">${day.weather[0].description}</div>
            <div class="temperature">
                <span class="max">${Math.round(day.temp.max - 273.15)}°C</span>
                <span class="min">${Math.round(day.temp.min - 273.15)}°C</span>
            </div>
        `;

        dailyWeatherContainer.appendChild(card);
    });
};

const fetchCityCoordinates = (city) => {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error(`Coordinates for ${city} not found. Please try again.`);
            }
            const cityInfo = { name: data[0].name, lat: data[0].lat, lon: data[0].lon };

            // Set the map view to the city coordinates
            map.setView([cityInfo.lat, cityInfo.lon], 10);

            // Fetch and display daily and hourly weather for the city
            fetchDailyWeather(cityInfo);
            fetchHourlyWeather(city);

            // Display weather markers on the map
        })
        .catch(error => console.error('Error fetching city coordinates:', error));
};


// Initialize Leaflet map
const map = L.map('map').setView([0,  0], 5); // Adjust default view as needed

// add layer on map for viewing cities in english
//https://rapidapi.com/MapTilesApi/api/maptiles/playground/apiendpoint_a511ac98-f95a-43c7-a518-19fe9d5071b6
L.tileLayer('https://maptiles.p.rapidapi.com/fr/map/v1/{z}/{x}/{y}.png?rapidapi-key={apikey}', {
	attribution: '&copy; <a href="http://www.maptilesapi.com/">MapTiles API</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	apikey: 'b441ba2bfemsh17b97b791ba1b09p116276jsn8ea43dc9608b',
	maxZoom: 19
}).addTo(map);
//api maptiles en
//b441ba2bfemsh17b97b791ba1b09p116276jsn8ea43dc9608b

// LAYERS FOR VIEWING WEATHER DATA
// doc : https://openweathermap.org/api/weathermaps
// add layer for viewing precipitations
// L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}', {
//     layer : 'precipitation_new',
//     apiKey : '8cf5ac5621c8d0266298a149e49d7514'
// }).addTo(map);

//add layer for viewing temperature 
L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}', {
    layer : 'temp_new',
    apiKey : '8cf5ac5621c8d0266298a149e49d7514'
}).addTo(map);

searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (city) {
        callWeatherAPI(city);
    }
});

searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (city) {
            callWeatherAPI(city);
        }
    }
});

dayName.textContent = getCurrentDayName();
const displayDate = () => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    dateElement.textContent = `${month} ${day}`;
};

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

const initializeWeather = () => {
    callWeatherAPI("Brussels"); 
    dayName.textContent = getCurrentDayName();
    displayDate(); 
};

document.addEventListener("DOMContentLoaded", initializeWeather);

const adjustMapSize = () => {
    if (map) {
        map.invalidateSize(); 
    }
};

const showMapContainer = () => {
    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block'; 
    adjustMapSize(); 
};

document.getElementById('mapButton').addEventListener('click', showMapContainer);

window.addEventListener('resize', adjustMapSize);

document.addEventListener("DOMContentLoaded", function() {
    // Get the containers
    const mainContainer = document.getElementById("mainContainer");
    const hourlyWeatherContainer = document.getElementById("hourlyWeatherContainer");
    const dailyWeatherContainer = document.getElementById("dailyWeatherContainer");
    const moodContainer = document.getElementById("moodContainer");
    const mapContainer = document.getElementById("map");

    function hideAllContainers() {
        mainContainer.style.display = 'none';
        hourlyWeatherContainer.style.display = 'none';
        dailyWeatherContainer.style.display = 'none';
        moodContainer.style.display = 'none';
        mapContainer.style.display = 'none';
    }

    function showContainer(container) {
        container.style.display = 'block';
    }

    document.getElementById("todayButton").addEventListener("click", function() {
        hideAllContainers();
        showContainer(mainContainer);
    });

    document.getElementById("hourlyButton").addEventListener("click", function() {
        hideAllContainers();
        showContainer(hourlyWeatherContainer);
    });

    document.getElementById("dailyButton").addEventListener("click", function() {
        hideAllContainers();
        showContainer(dailyWeatherContainer);
    });

    document.getElementById("mapButton").addEventListener("click", function() {
        hideAllContainers();
        showContainer(mapContainer);
    });

    document.getElementById("moodButton").addEventListener("click", function() {
        hideAllContainers();
        showContainer(moodContainer);
    });

    if (window.innerWidth <= 600) {
        hideAllContainers();
        showContainer(mainContainer);
    }
});

let initialWidth = window.innerWidth;

window.addEventListener('resize', function() {
    let currentWidth = window.innerWidth;
    
    if ((initialWidth <= 600 && currentWidth > 600) || (initialWidth > 600 && currentWidth <= 600)) {
        location.reload();
    }

    initialWidth = currentWidth;
});

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 600) {
        document.querySelector('.mobileNav').style.display = 'flex';
        document.getElementById('map').style.display = 'none';
    } else {
        document.querySelector('.mobileNav').style.display = 'none';
        document.getElementById('map').style.display = 'block';
    }
});
