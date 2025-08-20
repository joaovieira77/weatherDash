import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = '4fc41379e8e0c461e29347ef4405b25e';

function App() {
  const [city, setCity] = useState('');
  const [weatherCards, setWeatherCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;

      const [currentRes, forecastRes] = await Promise.all([
        axios.get(currentUrl),
        axios.get(forecastUrl),
      ]);

      const forecastData = forecastRes.data.list
        .filter((item) => item.dt_txt.includes('12:00:00'))
        .slice(0, 3);

      const newCard = {
        id: currentRes.data.id,
        name: currentRes.data.name,
        country: currentRes.data.sys.country,
        temp: Math.round(currentRes.data.main.temp),
        feels_like: Math.round(currentRes.data.main.feels_like),
        humidity: currentRes.data.main.humidity,
        wind: currentRes.data.wind.speed,
        condition: currentRes.data.weather[0].description,
        icon: currentRes.data.weather[0].icon,
        forecast: forecastData.map((day) => ({
          date: day.dt_txt.split(' ')[0],
          temp: Math.round(day.main.temp),
          icon: day.weather[0].icon,
          description: day.weather[0].description,
        })),
      };

      const alreadyExists = weatherCards.some((card) => card.id === newCard.id);
      if (!alreadyExists) {
        setWeatherCards((prev) => [newCard, ...prev]);
      }
      setCity('');
    } catch (err) {
      setError('City not found. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

          const [currentRes, forecastRes] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl),
          ]);

          const forecastData = forecastRes.data.list
            .filter((item) => item.dt_txt.includes('12:00:00'))
            .slice(0, 3);

          const locationCard = {
            id: currentRes.data.id,
            name: currentRes.data.name,
            country: currentRes.data.sys.country,
            temp: Math.round(currentRes.data.main.temp),
            feels_like: Math.round(currentRes.data.main.feels_like),
            humidity: currentRes.data.main.humidity,
            wind: currentRes.data.wind.speed,
            condition: currentRes.data.weather[0].description,
            icon: currentRes.data.weather[0].icon,
            forecast: forecastData.map((day) => ({
              date: day.dt_txt.split(' ')[0],
              temp: Math.round(day.main.temp),
              icon: day.weather[0].icon,
              description: day.weather[0].description,
            })),
          };

          const alreadyExists = weatherCards.some((card) => card.id === locationCard.id);
          if (!alreadyExists) {
            setWeatherCards((prev) => [locationCard, ...prev]);
          }
        } catch (err) {
          setError('Unable to fetch location weather.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError('Location access denied.');
      }
    );
  };

  const removeCard = (id) => {
    setWeatherCards((prev) => prev.filter((card) => card.id !== id));
  };

  return (
    <div className="app">
     <h1><img src="/weather.png" alt="Weather" style={{width: '48px', height: '48px', marginRight: '12px', verticalAlign: 'middle'}} />Weatherly</h1>

      {/* Search Container - Only contains search elements */}
      <div className="container">
        <div className="search">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather(city)}
          />
          <div className="search-buttons">
            <button onClick={() => fetchWeather(city)} className="search-button">
              Get Weather
            </button>
            <button onClick={fetchWeatherByCoords} className="search-button location-button">
              Use My Location
            </button>
          </div>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
      </div>

      {/* Weather Cards - Outside the container */}
      <div className="weather-list">
        {weatherCards.map((weather) => (
          <div key={weather.id} className="weather slide-up">
            <button className="remove-button" onClick={() => removeCard(weather.id)}>✖</button>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt="weather icon"
              className="weather-icon"
            />
            <div className="weather-info">
              <h2 className="weather-city">{weather.name}, {weather.country}</h2>
              <div className="weather-item">
                <span className="weather-label">Temperature</span>
                <span className="weather-value weather-temp">{weather.temp}°C</span>
              </div>
              <div className="weather-item">
                <span className="weather-label">Feels Like</span>
                <span className="weather-value">{weather.feels_like}°C</span>
              </div>
              <div className="weather-item">
                <span className="weather-label">Humidity</span>
                <span className="weather-value">{weather.humidity}%</span>
              </div>
              <div className="weather-item">
                <span className="weather-label">Wind</span>
                <span className="weather-value">{weather.wind} m/s</span>
              </div>
              <div className="weather-description">
                <div className="weather-label">Condition</div>
                <div className="weather-value">{weather.condition}</div>
              </div>
              <div className="forecast">
                {weather.forecast.map((day, i) => (
                  <div key={i} className="forecast-day">
                    <p>{day.date}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt="forecast icon"
                    />
                    <p>{day.temp}°C</p>
                    <p>{day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;