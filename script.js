function showWeatherContent(show) {
    document.getElementById('weather-content').style.display = show ? '' : 'none';
}

function getWeather() {
    const apiKey = '22ede6f00ba85eeec2e6eb36170f2f8e';
    const city = document.getElementById('city').value;

    if (!city) {
        showError('Please enter a city');
        showWeatherContent(false);
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    showError('');
    showWeatherContent(false);

    Promise.all([
        fetch(currentWeatherUrl).then(r => r.json()),
        fetch(forecastUrl).then(r => r.json())
    ]).then(([current, forecast]) => {
        displayWeather(current);
        displayHourlyForecast(forecast.list);
        displayDailyForecast(forecast.list);
        displayWeatherDetails(current);
        displayPrecipitation(forecast.list);
        showWeatherContent(true);
    }).catch(error => {
        showError('Error fetching weather data. Please try again.');
        showWeatherContent(false);
    });
}

function setDynamicBackground(weatherMain) {
    // Remove all overlays
    document.getElementById('rain-effect').style.display = 'none';
    document.getElementById('snow-effect').style.display = 'none';
    document.getElementById('rain-effect').innerHTML = '';
    document.getElementById('snow-effect').innerHTML = '';
    // Set background and overlays
    let body = document.body;
    if (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #283e51 100%)';
        // Show rain effect
        let rain = document.getElementById('rain-effect');
        rain.style.display = '';
        for (let i = 0; i < 60; i++) {
            let drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDelay = (Math.random() * 0.8) + 's';
            rain.appendChild(drop);
        }
    } else if (weatherMain === 'Snow') {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #b6c6e5 100%)';
        // Show snow effect
        let snow = document.getElementById('snow-effect');
        snow.style.display = '';
        for (let i = 0; i < 40; i++) {
            let flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDelay = (Math.random() * 2.5) + 's';
            snow.appendChild(flake);
        }
    } else if (weatherMain === 'Clouds') {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #757f9a 100%)';
    } else if (weatherMain === 'Clear') {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #2c5364 100%)';
    } else if (weatherMain === 'Mist' || weatherMain === 'Fog' || weatherMain === 'Haze') {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #616161 100%)';
    } else {
        body.style.background = 'linear-gradient(135deg, #232526 0%, #414345 100%)';
    }
}

function displayWeather(data) {
    // New UI elements
    const cityNameEl = document.getElementById('city-name');
    const dateEl = document.getElementById('date');
    const mainTempEl = document.getElementById('main-temp');
    const highTempEl = document.getElementById('high-temp');
    const lowTempEl = document.getElementById('low-temp');
    const weatherDescEl = document.getElementById('weather-desc');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherInfoDiv = document.getElementById('weather-info');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';

    if (data.cod === '404' || data.cod === 404) {
        showError(data.message);
        cityNameEl.textContent = '--';
        dateEl.textContent = '';
        mainTempEl.textContent = '--';
        highTempEl.textContent = '--';
        lowTempEl.textContent = '--';
        weatherDescEl.textContent = '';
        weatherIcon.style.display = 'none';
        setDynamicBackground('');
        return;
    }

    // City name
    cityNameEl.textContent = data.name;
    // Date
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    // Main temp (Celsius)
    const tempC = Math.round(data.main.temp - 273.15);
    mainTempEl.textContent = `${tempC}°`;
    // High/Low temp (Celsius)
    const highC = Math.round(data.main.temp_max - 273.15);
    const lowC = Math.round(data.main.temp_min - 273.15);
    highTempEl.textContent = `${highC}°`;
    lowTempEl.textContent = `${lowC}°`;
    // Weather description
    weatherDescEl.textContent = capitalizeFirstLetter(data.weather[0].description);
    // Weather icon
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;
    weatherIcon.style.display = 'inline-block';
    // Set dynamic background
    setDynamicBackground(data.weather[0].main);
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();
    // Show next 8 intervals (3-hour steps, ~24 hours)
    const next24Hours = hourlyData.slice(0, 8);
    next24Hours.forEach((item, idx) => {
        const dateTime = new Date(item.dt * 1000);
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        // Show 'NOW' for the first item if it's the current hour
        let hourLabel = (idx === 0 && Math.abs(hour - currentHour) <= 1) ? 'NOW' :
            (hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour-12}PM`);
        hourlyForecastDiv.innerHTML += `
            <div class="hourly-item">
                <span class="hour${hourLabel==='NOW' ? ' now' : ''}">${hourLabel}</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span class="temp">${temperature}°</span>
            </div>
        `;
    });
}

function displayDailyForecast(forecastList) {
    // Group by day
    const days = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString();
        if (!days[dayKey]) days[dayKey] = [];
        days[dayKey].push(item);
    });
    // Get up to 5 days
    const dayKeys = Object.keys(days).slice(0, 5);
    let html = '<div class="daily-forecast-row">';
    dayKeys.forEach(dayKey => {
        const items = days[dayKey];
        // Get min/max temp, icon from midday
        let min = 1000, max = -1000, icon = '', desc = '';
        items.forEach(item => {
            const t = item.main.temp - 273.15;
            if (t < min) min = t;
            if (t > max) max = t;
        });
        // Use icon from the item closest to 12:00
        let midday = items.reduce((prev, curr) => {
            const prevHour = new Date(prev.dt * 1000).getHours();
            const currHour = new Date(curr.dt * 1000).getHours();
            return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev;
        });
        icon = midday.weather[0].icon;
        desc = midday.weather[0].description;
        const dateObj = new Date(items[0].dt * 1000);
        const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        html += `<div class="daily-item" style="display:inline-block;text-align:center;margin:0 10px;">
            <div style="color:#fff;font-weight:600;">${dayLabel}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" style="width:36px;height:36px;">
            <div style="color:#fff;">${Math.round(max)}° / <span style="color:#ff7e5f;">${Math.round(min)}°</span></div>
        </div>`;
    });
    html += '</div>';
    document.getElementById('daily-forecast').innerHTML = html;
}

function displayWeatherDetails(current) {
    if (!current || !current.main) return;
    const sunrise = new Date(current.sys.sunrise * 1000);
    const sunset = new Date(current.sys.sunset * 1000);
    const orange = '#ff7e5f';
    const html = `
        <div style="color:#fff;line-height:1.7;">
            <div><b>Humidity:</b> <span style=\"color:${orange};font-weight:600;\">${current.main.humidity}%</span></div>
            <div><b>Wind:</b> <span style=\"color:${orange};font-weight:600;\">${current.wind.speed} m/s</span></div>
            <div><b>Pressure:</b> <span style=\"color:${orange};font-weight:600;\">${current.main.pressure} hPa</span></div>
            <div><b>Feels Like:</b> <span style=\"color:${orange};font-weight:600;\">${Math.round(current.main.feels_like - 273.15)}°C</span></div>
            <div><b>Sunrise:</b> <span style=\"color:${orange};font-weight:600;\">${sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
            <div><b>Sunset:</b> <span style=\"color:${orange};font-weight:600;\">${sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
        </div>
    `;
    document.getElementById('weather-details').innerHTML = html;
}

function displayPrecipitation(forecastList) {
    // Show next 24h precipitation probability/amount
    let html = '<div style="color:#fff;">';
    let found = false;
    const orange = '#ff7e5f';
    forecastList.slice(0, 8).forEach(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        let rain = item.rain ? (item.rain['3h'] || 0) : 0;
        let snow = item.snow ? (item.snow['3h'] || 0) : 0;
        if (rain || snow) {
            found = true;
            html += `<div style=\"margin-bottom:10px;\">${hour}:00 - Rain: <span style=\"color:${orange};font-weight:600;\">${rain} mm</span>, Snow: <span style=\"color:${orange};font-weight:600;\">${snow} mm</span></div>`;
        }
    });
    if (!found) html += `<div style=\"margin-bottom:10px;\">No precipitation expected in the next 24 hours.</div>`;
    html += '</div>';
    document.getElementById('precipitation-info').innerHTML = html;
}

function showError(message) {
    const weatherInfoDiv = document.getElementById('weather-info');
    weatherInfoDiv.innerHTML = message ? `<span style="color:#ff7e5f;font-weight:600;">${message}</span>` : '';
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Tab switching logic
window.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic (existing)
    const tabIds = ['tab-hourly', 'tab-daily', 'tab-details', 'tab-precip'];
    const sectionIds = ['hourly-forecast', 'daily-forecast', 'weather-details', 'precipitation-info'];
    tabIds.forEach((tabId, idx) => {
        document.getElementById(tabId).addEventListener('click', function() {
            tabIds.forEach(tid => document.getElementById(tid).classList.remove('active'));
            this.classList.add('active');
            sectionIds.forEach((sid, sidx) => {
                document.getElementById(sid).style.display = (idx === sidx) ? '' : 'none';
            });
        });
    });
    sectionIds.forEach((sid, idx) => {
        document.getElementById(sid).style.display = (idx === 0) ? '' : 'none';
    });

    // Geolocation on load
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        }, function(error) {
            // If denied or error, do nothing (search bar is always visible)
        });
    }
});

function getWeatherByCoords(lat, lon) {
    const apiKey = '22ede6f00ba85eeec2e6eb36170f2f8e';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    showError('');
    showWeatherContent(false);
    Promise.all([
        fetch(currentWeatherUrl).then(r => r.json()),
        fetch(forecastUrl).then(r => r.json())
    ]).then(([current, forecast]) => {
        displayWeather(current);
        displayHourlyForecast(forecast.list);
        displayDailyForecast(forecast.list);
        displayWeatherDetails(current);
        displayPrecipitation(forecast.list);
        showWeatherContent(true);
    }).catch(error => {
        showError('Error fetching weather data. Please try again.');
        showWeatherContent(false);
    });
}

// Remove placeholder calls
displayDailyForecastPlaceholder = function(){};
displayWeatherDetailsPlaceholder = function(){};
displayPrecipitationPlaceholder = function(){};
