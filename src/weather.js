const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function getWeather(lat, lon) {
  if (!API_KEY) {
    throw new Error("Weather API key is missing");
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}` +
    `&appid=${API_KEY}` +
    `&units=metric`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    city: data.name,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    condition: data.weather[0]?.main,
    description: data.weather[0]?.description,
    icon: data.weather[0]?.icon,
  };
}

export function buildSevenDayForecast({ environment, city = "Hyderabad", state = "Telanagana", permission = "" }) {
  const locationLabel = city
    ? `${city}${state ? `, ${state}` : ""}`
    : (permission === "granted" ? "Hyderabad" : "kothapet");
  const baseTemp = environment.temp;
  const baseHumidity = environment.humidity;
  const baseAir = environment.airQuality;
  const baseRain = environment.rainfall;
  const regionalPattern = environment.riskBias === "heat"
    ? { temp: 2, humidity: -3, rain: -10 }
    : environment.riskBias === "flood"
      ? { temp: -1, humidity: 5, rain: 16 }
      : { temp: 0, humidity: 0, rain: 0 };

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const tempSwing = index === 0 ? 0 : index % 3 === 0 ? 3 : index % 2 === 0 ? 1.5 : -1;
    const temp = Math.min(46, Math.max(18, baseTemp + regionalPattern.temp + tempSwing + (environment.floodRisk > 55 ? 1.4 : 0)));
    const humidity = Math.min(95, Math.max(35, baseHumidity + regionalPattern.humidity + (index > 3 ? 8 : 0) + (environment.floodRisk > 50 ? 10 : 0)));
    const airQuality = Math.min(100, Math.max(18, baseAir + (index > 2 ? 10 : 0) + (environment.riskBias === "heat" ? 8 : 0)));
    const rainfall = Math.min(120, Math.max(8, baseRain + regionalPattern.rain + (index > 2 ? 20 : 0) + (environment.floodRisk > 50 ? 18 : 0)));
    const riskScore = Math.min(100, Math.round(
      airQuality * 0.32 +
      Math.max(0, temp - 28) * 3.8 +
      Math.max(0, humidity - 60) * 0.7 +
      Math.max(0, rainfall - 30) * 0.9 +
      (environment.windSpeed > 30 ? 14 : 0)
    ));

    let warning = "Stable weather";
    let eventType = "Normal";
    if (temp > 34 || airQuality > 70) {
      warning = temp > 34 ? "Heatwave risk" : "Air pollution risk";
      eventType = "Extreme weather";
    }
    if (rainfall > 55 || environment.floodRisk > 60) {
      warning = "Heavy rain / flood risk";
      eventType = "Extreme weather";
    }
    if (environment.windSpeed > 40) {
      warning = "Strong wind alert";
      eventType = "Extreme weather";
    }

    return {
      date,
      label: date.toLocaleDateString([], { weekday: "short" }),
      fullDate: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      temp: Math.round(temp),
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall),
      airQuality: Math.round(airQuality),
      riskScore,
      warning,
      eventType,
      locationLabel,
      regionLabel: environment.regionLabel,
    };
  });
}
