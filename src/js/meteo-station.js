/**
 * A class for making API calls to OpenWeatherMap.
 */
export class MeteoStation {
  /**
   * Holds the API key.
   * @private
   * @type {string}
   */
  #API_KEY = '380c736aa5d1125df5cc1b66127b1134';

  /**
   * Holds the current weather endpoint URL.
   * @private
   * @type {string}
   */
  #CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  /**
   * Holds the forecast endpoint URL.
   * @private
   * @type {string}
   */
  #FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  /**
   * Holds the air pollution endpoint URL.
   * @private
   * @type {string}
   */
  #AIR_POLLUTION_API_URL =
    'http://api.openweathermap.org/data/2.5/air_pollution';

  /**
   * Holds the geocoding endpoint URL.
   * @private
   * @type {string}
   */
  #GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';

  /**
   * Holds the reverse geocoding endpoint URL.
   * @private
   * @type {string}
   */
  #REVERSE_GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/reverse';

  /**
   * Calls the given endpoint with the given arguments.
   * @param {string} url - The endpoint URL.
   * @param {object} args - The call parameters.
   * @returns {Promise<any>} - The response data or an error.
   */
  async call(url = '', args = {}) {
    try {
      // Get url as URL object.
      const baseUrl = new URL(url);
      // Add call parameters.
      baseUrl.search = new URLSearchParams({
        ...args,
        appid: this.#API_KEY,
        units: 'metric',
      });
      // Make a call.
      const response = await fetch(baseUrl, {
        method: 'GET',
      });
      // Gather data from response.
      const data = await response.json();
      // Show it to the world.
      return data;
    } catch (error) {
      console.error(error);
      throw new Error('Unable to fetch data from API.');
    }
  }

  /**
   * Retrieves geolocation information from a query string.
   * @param {string} query - The query string.
   * @returns {Promise<any>} - The geolocation information or an error.
   */
  getGeoLocationByQueryString(query) {
    return this.call(this.#GEOCODING_API_URL, { q: query, limit: 5 });
  }

  /**
   * Retrieves geolocation information from coordinates.
   * @param {number} lat - The latitude.
   * @param {number} lon - The longitude.
   * @returns {Promise<any>} - The geolocation information or an error.
   */
  getGeoLocationByCoordinates(lat, lon) {
    return this.call(this.#REVERSE_GEOCODING_API_URL, { lat, lon });
  }

  /**
   * Calls the OpenWeatherMap API to get the current weather for a given latitude and longitude.
   * @param {number} lat - The latitude of the location to get the weather for.
   * @param {number} lon - The longitude of the location to get the weather for.
   * @returns {Promise<any>} - The current weather data for the given location.
   */
  getCurrentWeather(lat, lon) {
    return this.call(this.#CURRENT_WEATHER_API_URL, { lat, lon });
  }

  /**
   * Calls the OpenWeatherMap API to get the forecast for a given latitude and longitude.
   * @param {number} lat - The latitude of the location to get the forecast for.
   * @param {number} lon - The longitude of the location to get the forecast for.
   * @returns {Promise<any>} - The forecast data for the given location.
   */
  getForecast(lat, lon) {
    return this.call(this.#FORECAST_API_URL, { lat, lon });
  }

  /**
   * Calls the OpenWeatherMap API to get the air quality for a given latitude and longitude.
   * @param {number} lat - The latitude of the location to get the air quality for.
   * @param {number} lon - The longitude of the location to get the air quality for.
   * @returns {Promise<any>} - The air quality data for the given location.
   */
  getAirQuality(lat, lon) {
    return this.call(this.#AIR_POLLUTION_API_URL, { lat, lon });
  }
}
