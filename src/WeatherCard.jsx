import { useEffect, useState } from "react";
import { getWeatherByLocation } from "./services/weather";

function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const data = await getWeatherByLocation();
        if (active) setWeather(data);
      } catch (err) {
        if (active) setError(err.message || "Unable to load weather");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Detecting your location and weather...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div>
      <h2>Weather in {weather.city}</h2>
      <h1>{Math.round(weather.temperature)}°C</h1>
      <p>Feels like: {Math.round(weather.feelsLike)}°C</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind: {weather.windSpeed} m/s</p>
      <p>Condition: {weather.description}</p>
      <p>
        Location: {weather.latitude.toFixed(4)}, {weather.longitude.toFixed(4)}
      </p>
    </div>
  );
}

export default WeatherCard;
