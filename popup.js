const getWeatherBtn = document.getElementById('getWeather');
const status = document.getElementById('status');
const result = document.getElementById('result');
const city = document.getElementById('city');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const icon = document.getElementById('icon');
const unitCheckbox = document.getElementById('unitCheckbox');
const unitLabel = document.getElementById('unitLabel');
const API_KEY  = 'c942bb301c694961b28102939250907';       
const API_URL = 'https://api.weatherapi.com/v1/current.json';
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getData(key, defaultValue) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultValue;
  } catch {
    return defaultValue;
  }
}
window.addEventListener('DOMContentLoaded', () => {
  const savedUnit = getData('unit', 'C');
  unitCheckbox.checked = savedUnit === 'F';
  unitLabel.textContent = savedUnit === 'F' ? 'Show °C' : 'Show °F';
  const lastWeather = getData('lastWeather', null);
  if (lastWeather) {
    showWeather(lastWeather);
    result.classList.remove('hidden');
  }
});
unitCheckbox.addEventListener('change', () => {
  const unit = unitCheckbox.checked ? 'F' : 'C';
  unitLabel.textContent = unit === 'F' ? 'Show °C' : 'Show °F';
  saveData('unit', unit);
  const lastWeather = getData('lastWeather', null);
  if (lastWeather) showWeather(lastWeather);
});
getWeatherBtn.addEventListener('click', () => {
  status.textContent = 'Getting location...';
  result.classList.add('hidden');
  if (!navigator.geolocation) {
    status.textContent = 'Geolocation not supported.';
    return;
  }
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 600000
  });
});
function success(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  status.textContent = 'Getting weather...';
  const url = `${API_URL}?key=${API_KEY}&q=${lat},${lon}`;
  fetch(url)
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
      saveData('lastWeather', data);
      showWeather(data);
      result.classList.remove('hidden');
      status.textContent = '';
    })
    .catch(() => {
      status.textContent = 'Could not get weather.';
    });
}
function error(err) {
  if (err.code === err.PERMISSION_DENIED) {
    status.textContent = 'Location access denied.';
  } else {
    status.textContent = 'Failed to get location.';
  }
}
function showWeather(data) {
  const useF = getData('unit', 'C') === 'F';
  city.textContent = `${data.location.name}, ${data.location.country}`;
  temp.textContent = `Temperature: ${useF ? data.current.temp_f : data.current.temp_c}°${useF ? 'F' : 'C'}`;
  condition.textContent = `Condition: ${data.current.condition.text}`;
  icon.src = `https:${data.current.condition.icon}`;
}