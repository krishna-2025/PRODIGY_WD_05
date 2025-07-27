const apiKey = "1890ce8219ab67170d5904ea6438a76d"; // OpenWeatherMap API key

// Get weather by city name input
function getWeatherByCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (city === "") return;
  fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`, city);
  hideSuggestions();
}

// Get weather using user's current location
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`, "My Location");
    }, () => {
      alert("Location access denied.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}

// Fetch weather data from OpenWeather API
function fetchWeather(url, cityName = "") {
  document.getElementById('spinner').style.display = 'block'; 
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("City not found.");
      return response.json();
    })
    .then(data => {
      displayWeather(data);     
      if (cityName !== "My Location") saveRecentCity(data.name); 
    })
    .catch(error => {
      document.getElementById('weather').innerHTML = `<p style="color:red;">⚠️ ${error.message}</p>`;
    })
    .finally(() => {
      document.getElementById('spinner').style.display = 'none'; 
    });
}

// Display weather info on screen
function displayWeather(data) {
  const weatherHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <div class="info">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
      <p><strong>${data.weather[0].main}</strong>: ${data.weather[0].description}</p>
    </div>
    <div class="info">🌡️ Temp: ${data.main.temp} °C</div>
    <div class="info">💧 Humidity: ${data.main.humidity}%</div>
    <div class="info">💨 Wind: ${data.wind.speed} m/s</div>
  `;
  document.getElementById('weather').innerHTML = weatherHTML;
}

// Clear weather and input field
function clearWeather() {
  document.getElementById('weather').innerHTML = "";
  document.getElementById('cityInput').value = "";
}

// Save searched city in localStorage
function saveRecentCity(city) {
  let recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!recent.includes(city)) {
    recent.unshift(city);         
    if (recent.length > 5) recent.pop(); 
    localStorage.setItem("recentCities", JSON.stringify(recent));
  }
  displayRecentCities();    
}

// Display recent searched cities as clickable buttons
function displayRecentCities() {
  const recent = JSON.parse(localStorage.getItem("recentCities")) || [];
  const container = document.getElementById('recentCities');
  container.innerHTML = '';
  recent.forEach(city => {
    const btn = document.createElement("button");
    btn.innerText = city;
    btn.className = "recent-btn";
    btn.onclick = () => {
      fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`, city);
    };
    container.appendChild(btn);
  });
}

// Toggle between light and dark theme
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  const toggleBtn = document.getElementById('toggleBtn');
  toggleBtn.innerText = body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Load recent cities on page load
window.onload = () => {
  displayRecentCities();
};

// Show city suggestions while typing
function showSuggestions(query) {
  const suggestions = document.getElementById('suggestions');
  if (!query) {
    hideSuggestions();
    return;
  }
  const matches = citiesList.filter(city =>
    city.toLowerCase().startsWith(query.toLowerCase())
  );
  suggestions.innerHTML = matches.map(match => `<div onclick="selectCity('${match}')">${match}</div>`).join('');
  suggestions.style.display = matches.length ? 'block' : 'none';
}

// Select a city from suggestions
function selectCity(city) {
  document.getElementById('cityInput').value = city;
  hideSuggestions();
}

// Hide suggestions dropdown
function hideSuggestions() {
  document.getElementById('suggestions').style.display = 'none';
}
