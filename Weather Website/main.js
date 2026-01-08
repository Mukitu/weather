/**
 * Modern Weather App
 * A responsive weather application using OpenWeatherMap API
 * 
 * Features:
 * - Location detection
 * - Dynamic weather-based backgrounds
 * - Responsive design
 * - Smooth animations
 * 
 * Author: Nishat
 */

// API Configuration - Replace with your own OpenWeatherMap API key
const API_KEY = '7871eae87c06235210eaae555bacd7cd'; // Get your API key from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityNameElement = document.getElementById('cityName');
const temperatureElement = document.getElementById('temperatureValue');
const weatherDescriptionElement = document.getElementById('weatherDescription');
const windSpeedElement = document.getElementById('windSpeed');
const humidityElement = document.getElementById('humidity');
const feelsLikeElement = document.getElementById('feelsLike');
const weatherIconElement = document.getElementById('weatherIcon');
const lastUpdatedElement = document.getElementById('lastUpdated');
const weatherBackgroundElement = document.getElementById('weatherBackground');
const cityInputElement = document.getElementById('cityInput');
const searchBtnElement = document.getElementById('searchBtn');
const locationBtnElement = document.getElementById('locationBtn');
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('errorMessage');
const errorTextElement = document.getElementById('errorText');
const retryBtnElement = document.getElementById('retryBtn');

// Weather condition to background mapping
const weatherBackgrounds = {
    'clear': 'clear-gradient',
    'sunny': 'sunny-gradient',
    'clouds': 'cloudy-gradient',
    'rain': 'rainy-gradient',
    'drizzle': 'rainy-gradient',
    'thunderstorm': 'rainy-gradient',
    'snow': 'snow-gradient',
    'mist': 'cloudy-gradient',
    'smoke': 'cloudy-gradient',
    'haze': 'cloudy-gradient',
    'dust': 'cloudy-gradient',
    'fog': 'cloudy-gradient',
    'sand': 'sunny-gradient',
    'ash': 'cloudy-gradient',
    'squall': 'rainy-gradient',
    'tornado': 'rainy-gradient'
};

// Weather condition to icon mapping
const weatherIcons = {
    'clear': 'fas fa-sun',
    'sunny': 'fas fa-sun',
    'clouds': 'fas fa-cloud',
    'rain': 'fas fa-cloud-rain',
    'drizzle': 'fas fa-cloud-rain',
    'thunderstorm': 'fas fa-bolt',
    'snow': 'fas fa-snowflake',
    'mist': 'fas fa-smog',
    'smoke': 'fas fa-smog',
    'haze': 'fas fa-smog',
    'dust': 'fas fa-smog',
    'fog': 'fas fa-smog',
    'sand': 'fas fa-sun',
    'ash': 'fas fa-mountain',
    'squall': 'fas fa-wind',
    'tornado': 'fas fa-wind'
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Weather App initialized');
    
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeatherMap API key in main.js file.');
        return;
    }
    
    // Set up event listeners
    searchBtnElement.addEventListener('click', searchWeather);
    cityInputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });
    
    locationBtnElement.addEventListener('click', getLocationWeather);
    retryBtnElement.addEventListener('click', retryLastAction);
    
    // Try to get user's location on page load
    getLocationWeather();
});

/**
 * Get weather by user's current location
 */
function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        },
        error => {
            console.error('Geolocation error:', error);
            
            // Default to a popular city if location access is denied
            if (error.code === error.PERMISSION_DENIED) {
                showError('Location access denied. Showing weather for London instead.');
                fetchWeatherByCity('London');
            } else {
                showError('Unable to retrieve your location. Please try searching for a city.');
            }
        }
    );
}

/**
 * Search weather by city name
 */
function searchWeather() {
    const city = cityInputElement.value.trim();
    
    if (!city) {
        showError('Please enter a city name.');
        return;
    }
    
    showLoading();
    fetchWeatherByCity(city);
}

/**
 * Fetch weather data by city name
 * @param {string} city - The city name
 */
async function fetchWeatherByCity(city) {
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else {
                throw new Error('Unable to fetch weather data. Please try again.');
            }
        }
        
        const data = await response.json();
        updateWeatherDisplay(data);
        cityInputElement.value = ''; // Clear input after successful search
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    }
}

/**
 * Fetch weather data by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data. Please try again.');
        }
        
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    }
}

/**
 * Update the UI with weather data
 * @param {Object} data - Weather data from API
 */
function updateWeatherDisplay(data) {
    console.log('Weather data received:', data);
    
    // Extract relevant data
    const city = data.name;
    const country = data.sys.country;
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const description = data.weather[0].description;
    const mainCondition = data.weather[0].main.toLowerCase();
    
    // Update DOM elements
    cityNameElement.textContent = `${city}, ${country}`;
    temperatureElement.textContent = temperature;
    weatherDescriptionElement.textContent = description;
    windSpeedElement.textContent = `${Math.round(windSpeed * 3.6)} km/h`; // Convert m/s to km/h
    humidityElement.textContent = `${humidity} %`;
    feelsLikeElement.textContent = `${feelsLike} °C`;
    
    // Update weather icon
    const iconClass = weatherIcons[mainCondition] || 'fas fa-cloud';
    weatherIconElement.className = iconClass;
    
    // Update last updated time
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lastUpdatedElement.textContent = `Last updated: ${timeString}`;
    
    // Update background based on weather condition
    updateBackground(mainCondition);
    
    // Hide loading and show weather card
    hideLoading();
    hideError();
    
    // Animate temperature change
    animateValue(temperatureElement, 0, temperature, 1000);
}

/**
 * Update the background based on weather condition
 * @param {string} condition - The main weather condition
 */
function updateBackground(condition) {
    // Find the appropriate background class
    let bgClass = weatherBackgrounds[condition] || 'clear-gradient';
    
    // Determine if it's night time (for future enhancement)
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    
    // If it's night, use night gradient for certain conditions
    if (isNight && ['clear', 'sunny'].includes(condition)) {
        bgClass = 'night-gradient';
    }
    
    // Apply the background class
    weatherBackgroundElement.className = 'background';
    
    // Add a small delay before applying the new background for smoother transition
    setTimeout(() => {
        document.documentElement.style.setProperty(`--${bgClass.split('-')[0]}-gradient`, getGradientByClass(bgClass));
        weatherBackgroundElement.style.background = `var(--${bgClass.split('-')[0]}-gradient)`;
    }, 50);
}

/**
 * Get the actual gradient value by class name
 * @param {string} className - The gradient class name
 * @returns {string} - The CSS gradient value
 */
function getGradientByClass(className) {
    const gradients = {
        'sunny-gradient': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        'cloudy-gradient': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'rainy-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'snow-gradient': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        'night-gradient': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'clear-gradient': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    };
    
    return gradients[className] || gradients['clear-gradient'];
}

/**
 * Animate a numeric value change
 * @param {HTMLElement} element - The element to animate
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/**
 * Show loading state
 */
function showLoading() {
    loadingElement.style.display = 'block';
    document.querySelector('.weather-card').style.opacity = '0.5';
    document.querySelector('.weather-card').style.pointerEvents = 'none';
}

/**
 * Hide loading state
 */
function hideLoading() {
    loadingElement.style.display = 'none';
    document.querySelector('.weather-card').style.opacity = '1';
    document.querySelector('.weather-card').style.pointerEvents = 'auto';
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorTextElement.textContent = message;
    errorMessageElement.style.display = 'block';
    loadingElement.style.display = 'none';
    document.querySelector('.weather-card').style.opacity = '0.5';
    document.querySelector('.weather-card').style.pointerEvents = 'none';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessageElement.style.display = 'none';
    document.querySelector('.weather-card').style.opacity = '1';
    document.querySelector('.weather-card').style.pointerEvents = 'auto';
}

/**
 * Retry the last action (location or search)
 */
function retryLastAction() {
    hideError();
    
    // If there's text in the search input, retry search
    if (cityInputElement.value.trim()) {
        searchWeather();
    } else {
        // Otherwise retry location
        getLocationWeather();
    }
}

/**
 * Add some sample weather data for demonstration (if API fails)
 * This is a fallback function for demo purposes
 */
function loadSampleData() {
    const sampleData = {
        name: 'London',
        sys: { country: 'UK' },
        main: {
            temp: 18,
            feels_like: 17,
            humidity: 65
        },
        wind: { speed: 4.5 },
        weather: [{ description: 'partly cloudy', main: 'Clouds' }]
    };
    
    updateWeatherDisplay(sampleData);
    showError('Using sample data. Please add your API key for real weather data.');
}

// If API key is not set, load sample data for demonstration
if (API_KEY === 'YOUR_API_KEY_HERE') {
    // Wait a moment then show the error and load sample data
    setTimeout(() => {
        loadSampleData();
    }, 500);
}