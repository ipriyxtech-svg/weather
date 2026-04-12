export async function getWeather(city: string) {
  const API_KEY = "57770725e1b7af0fe1585301467f4ae0";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );

  const data = await res.json();
  return data;
}