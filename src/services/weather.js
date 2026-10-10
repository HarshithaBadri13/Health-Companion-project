import { getWeather } from "../weather";

export function getWeatherByLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const weather = await getWeather(coords.latitude, coords.longitude);
          resolve({ ...weather, latitude: coords.latitude, longitude: coords.longitude });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(new Error(error.message || "Unable to detect your location")),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}
