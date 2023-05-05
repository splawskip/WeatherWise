import { buildErrorPopup } from './utils';
/**
 * A class for making API calls to OpenWeather.
 */
export class MeteoStation {
  /**
   * Holds the API key.
   *
   * @private
   * @type {string}
   */
  #API_KEY = '380c736aa5d1125df5cc1b66127b1134';

  /**
   * Holds API URL.
   *
   * @private
   * @type {string}
   */
  #API_URL = 'https://api.openweathermap.org/';

  /**
   * Holds the current weather endpoint URL.
   *
   * @private
   * @type {string}
   */
  #CURRENT_WEATHER_ENDPOINT = 'data/2.5/weather';

  /**
   * Holds the forecast endpoint URL.
   *
   * @private
   * @type {string}
   */
  #FORECAST_API_ENDPOINT = 'data/2.5/forecast';

  /**
   * Holds the air pollution endpoint URL.
   *
   * @private
   * @type {string}
   */
  #AIR_POLLUTION_ENDPOINT = 'data/2.5/air_pollution';

  /**
   * Holds the geocoding endpoint URL.
   *
   * @private
   * @type {string}
   */
  #GEOCODING_ENDPOINT = 'geo/1.0/direct';

  /**
   * Holds the reverse geocoding endpoint URL.
   *
   * @private
   * @type {string}
   */
  #REVERSE_GEOCODING_ENDPOINT = 'geo/1.0/reverse';

  /**
   * Calls the given endpoint with the given arguments.
   *
   * @async
   * @param {string} url - The endpoint URL.
   * @param {object} args - The call parameters.
   * @throws {Error} If the URL is not a non-empty string, the args are not an object, or the args are an empty object.
   * @returns {Promise<any>} - The response data or an error.
   */
  async call(url = '', args = {}) {
    try {
      // Check if url is a non-empty string.
      if (typeof url !== 'string' || url.trim().length === 0) {
        throw new Error('URL must be a non-empty string.');
      }
      // Check if args is an object.
      if (typeof args !== 'object' || args === null) {
        throw new Error('Args must be an object.');
      }
      // Check if args is not an empty object.
      if (Object.keys(args).length === 0) {
        throw new Error('Args must not be an empty object.');
      }
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
      // Await for JSON response.
      const data = await response.json();
      // Show data to the world.
      return data;
    } catch (error) {
      // Inform user that something went wrong.
      buildErrorPopup(document.querySelector('[data-weather="error-popup"]'), {
        title: error.name,
        message: error.message,
      });
      // Show error data to the world.
      return error;
    }
  }

  /**
   * Retrieves geolocation information from a query string.
   *
   * @param {object} args - The query args.
   * @returns {Promise<any>} - The geolocation information or an error.
   */
  getGeoLocationByQueryString(args) {
    return this.call(`${this.#API_URL}${this.#GEOCODING_ENDPOINT}`, args);
  }

  /**
   * Retrieves geolocation information from coordinates.
   *
   * @param {object} args - The query args.
   * @returns {Promise<any>} - The geolocation information or an error.
   */
  getGeoLocationByCoordinates(args) {
    return this.call(`${this.#API_URL}${this.#REVERSE_GEOCODING_ENDPOINT}`, args);
  }

  /**
   * Calls the OpenWeatherMap API to get the current weather for a given latitude and longitude.
   *
   * @param {object} args - The query args.
   * @returns {Promise<any>} - The current weather data for the given location.
   */
  getCurrentWeather(args) {
    return this.call(`${this.#API_URL}${this.#CURRENT_WEATHER_ENDPOINT}`, args);
    // return this.call(`${this.#API_URL}${this.#CURRENT_WEATHER_ENDPOINT}`, []);
  }

  /**
   * Calls the OpenWeatherMap API to get the forecast for a given latitude and longitude.
   *
   * @param {object} args - The query args.
   * @returns {Promise<any>} - The forecast data for the given location.
   */
  getForecast(args) {
    return this.call(`${this.#API_URL}${this.#FORECAST_API_ENDPOINT}`, args);
  }

  /**
   * Calls the OpenWeatherMap API to get the air quality for a given latitude and longitude.
   *
   * @param {object} args - The query args.
   * @returns {Promise<any>} - The air quality data for the given location.
   */
  getAirQuality(args) {
    return this.call(`${this.#API_URL}${this.#AIR_POLLUTION_ENDPOINT}`, args);
  }

  /**
   * Calls the OpenWeatherMap API to get the air quality for a given latitude and longitude.
   *
   * @static
   * @param {number} airQualityLevel - The number that represents air quality level.
   * @returns {object} - The object that holds air quality data.
   */
  static getAirQualityData(airQualityLevel) {
    // Define air qualities.
    const airQualities = {
      1: {
        quality: 'Good',
        description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      },
      2: {
        quality: 'Fair',
        description:
          'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.',
      },
      3: {
        quality: 'Moderate',
        description:
          'Members of sensitive groups may experience health effects. The general public is not likely to be affected.',
      },
      4: {
        quality: 'Poor',
        description:
          'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
      },
      5: {
        quality: 'Very Poor',
        description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
      },
    };
    // Output air quality that matches given air quality level.
    return airQualities[airQualityLevel];
  }
}
