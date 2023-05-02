import { MeteoStation } from './meteo-station';
import { Router } from './router';
import { debounce, delegateEvent, replaceHTML, unixTimeToHumanReadable } from './utils';
// Settle WeatherWise Meteo Station.
const WeatherWise = new MeteoStation();
// Build the app.
const App = {
  /** Gather app components. */
  $: {
    /** App container. */
    app: document.querySelector('[data-weather="app"]'),
    /** Search components */
    search: document.querySelector('[data-weather="search-input"]'),
    searchView: document.querySelector('[data-weather="search-view"]'),
    searchWrapper: document.querySelector('[data-weather="search-wrapper"]'),
    searchResults: document.querySelector('[data-weather="search-results"]'),
    searchViewToggles: document.querySelectorAll('[data-weather="search-toggle"]'),
    /** App sections */
    currentWeatherSection: document.querySelector('[data-weather="current-weather-section"]'),
    forecastSection: document.querySelector('[data-weather="forecast-section"]'),
    highlightsSection: document.querySelector('[data-weather="highlights-section"]'),
    todayAtSection: document.querySelector('[data-weather="today-at-section"]'),
    todaysTemperature: document.querySelector('[data-weather="todays-temperature"]'),
    todaysWind: document.querySelector('[data-weather="todays-wind"]'),
  },
  /**
   * Updates the search results with the provided locations data.
   *
   * @param {array} locations - Array that holds locations.
   * @returns {void}
   */
  updateSearchResults(locations) {
    // Early return if there are not any locations.
    if (!locations.length) {
      App.$.searchWrapper.classList.remove('search__wrapper--has-results');
      return;
    }
    // Indicate that the search results has results.
    App.$.searchWrapper.classList.add('search__wrapper--has-results');
    // Loop over locations data and build search results item component that is sprinkled with the location data.
    const searchResults = locations
      .map(({ name, state, country, lat, lon }) => {
        return `
          <li class="search__results-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="search__results-item-icon" viewBox="0 0 16 20">
              <path
                d="M8 9.925c.533 0 .992-.188 1.375-.563.383-.375.575-.829.575-1.362 0-.533-.192-.992-.575-1.375A1.876 1.876 0 0 0 8 6.05c-.533 0-.987.192-1.362.575A1.896 1.896 0 0 0 6.075 8c0 .533.188.987.563 1.362.375.375.829.563 1.362.563Zm0 7.5c2.05-1.883 3.575-3.592 4.575-5.125s1.5-2.9 1.5-4.1c0-1.85-.588-3.358-1.763-4.525C11.137 2.508 9.7 1.925 8 1.925c-1.7 0-3.133.583-4.3 1.75C2.533 4.842 1.95 6.35 1.95 8.2c0 1.2.496 2.567 1.488 4.1.991 1.533 2.512 3.242 4.562 5.125Zm0 2.125a1.13 1.13 0 0 1-.362-.062A1.04 1.04 0 0 1 7.3 19.3c-2.433-2.15-4.246-4.142-5.437-5.975C.671 11.492.075 9.783.075 8.2c0-2.483.796-4.463 2.388-5.938C4.054.787 5.9.05 8 .05s3.95.737 5.55 2.212c1.6 1.475 2.4 3.455 2.4 5.938 0 1.583-.6 3.292-1.8 5.125-1.2 1.833-3.017 3.825-5.45 5.975a.79.79 0 0 1-.312.188A1.232 1.232 0 0 1 8 19.55Z"
              />
            </svg>
            <span class="search__results-item-data">
              <h3 class="search__results-item-city">${name}</h3>
              <p class="search__results-item-country">${state}, ${country}</p>
            </span>
            <a href="#/weather?lat=${lat}&lon=${lon}" class="search__results-item-link" data-weather="search-results-item">
            </a>
          </li>
        `;
      })
      .join('');
    // Update search results.
    replaceHTML(App.$.searchResults, searchResults);
  },
  /**
   * Updates the current weather section with the weather data for a given latitude and longitude.
   *
   * @param {object} currentWeather - Object that contains data about curren weather.
   * @returns {void}
   */
  updateCurrentWeather(currentWeather) {
    // Pull out the required data from main object to build the component.
    const {
      weather: [{ description, icon }],
      dt: dateUnix,
      sys: { country },
      main: { temp },
      name: city,
    } = currentWeather;
    // Render component.
    replaceHTML(
      App.$.currentWeatherSection,
      `
        <h3 class="title section__title current-weather-card__title">Now</h3>
        <p class="current-weather-card__details">
          <span class="current-weather-card__temperature">
            ${parseInt(temp, 10)}
            <span class="current-weather-card__temperature-unit">
              &#8451;
            </span>
          </span>
          <img loading="lazy" src="./icons/weather/${icon}-desktop.webp" alt="Icons that represents todays weather as ${description}" class="current-weather__icon" />
        </p>
        <p class="current-weather-card__conditions">${description}</p>
        <hr class="separator current-weather-card__separator" />
        <p class="current-weather-card__date">
          ${unixTimeToHumanReadable(dateUnix, {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </p>
        <p class="current-weather-card__location">${city}, ${country}</p>
      `
    );
  },
  /**
   * Updates the current weather section with the weather data for a given latitude and longitude.
   *
   * @param {object} forecast - Object that contains data about curren weather.
   * @returns {void}
   */
  updateForecast(forecast) {
    // Build forecast component.
    const forecastComponent = forecast
      .filter((_, index) => (index + 1) % 8 === 0)
      .map(({ weather: [{ icon, description }], dt: dateUnix, main: { temp_max: tempMax, temp_min: tempMin } }) => {
        return `
              <div class="forecast-card__day-forecast">
                <p class="forecast-card__temperatures">
                  <img loading="lazy" src="./icons/weather/${icon}-mobile.webp" srcset="./icons/weather/${icon}-mobile.webp 32w, ./icons/weather/${icon}-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Icon that represents todays weather as ${description}" class="forecast-card__icon" />
                  <span class="forecast-card__day-temperature">
                    ${parseInt(tempMax, 10)}&#8451;
                  </span>
                  <span class="forecast-card__night-temperature">
                    ${parseInt(tempMin, 10)}&#8451;
                  </span>
                </p>
                <p class="forecast-card__date">
                  <span class="forecast-card__calendar-date">
                    ${unixTimeToHumanReadable(dateUnix, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span class="forecast-card__day">
                    ${unixTimeToHumanReadable(dateUnix, {
                      weekday: 'long',
                    })}
                  </span>
                </p>
              </div>
            `;
      })
      .join('');
    // Render component sprinkled by forecast data.
    replaceHTML(App.$.forecastSection, forecastComponent);
  },
  /**
   * Updates the current weather section with the weather data for a given latitude and longitude.
   *
   * @param {object} airQuality - Object that contains data about current air quality.
   * @returns {string} - HTML markup for the air quality component.
   */
  buildAirQualityComponent(airQuality) {
    // Pull only needed data.
    const [
      {
        components: { pm2_5: pm25, so2, no2, o3 },
        main: { aqi: airQualityIndex },
      },
    ] = airQuality;
    // Get data about current air quality.
    const { quality, description } = MeteoStation.getAirQualityData(airQualityIndex);
    // Build status indicator class variant that matches current air quality.
    const airQualityClass = quality.replace(/\s+/g, '-').toLowerCase();
    // Build component and hydrate it with data.
    const airQualityComponent = `
        <section class="highlight-card highlight-card--large highlight__air-quality">
        <h4 class="highlight-card__title">
          air quality index
          <span class="status-indicator status-indicator--${airQualityClass}" title="${description}">${quality}
          </span>
        </h4>
        <div class="highlight-card__data-set">
          <img loading="lazy" src="./icons/air-mobile.webp" srcset="./icons/air-mobile.webp 32w, ./icons/air-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Wind icon - Represents current air quality" class="class highlight-card__icon" />
          <div class="highlight-card__data highlight-card__data--multiple-values">
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${pm25.toPrecision(3)}
              <span class="highlight-card__unit">PM<span class="highlight-card__unit--sub">2.5</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${so2.toPrecision(3)}
               <span class="highlight-card__unit">SO<span class="highlight-card__unit--sub">2</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${no2.toPrecision(3)}
               <span class="highlight-card__unit">NO<span class="highlight-card__unit--sub">2</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${o3.toPrecision(3)}
              <span class="highlight-card__unit">O<span class="highlight-card__unit--sub">3</span></span>
            </p>
          </div>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return airQualityComponent;
  },
  /**
   * Builds and returns a HTML string of a sunrise and sunset card component.
   *
   * @param {number} sunrise - UNIX timestamp of the sunrise time.
   * @param {number} sunset - UNIX timestamp of the sunset time.
   * @returns {string} - HTML markup for the sunrise and sunset card component.
   */
  buildSunComponent(sunrise, sunset) {
    // Build component and hydrate it with data.
    const sunComponent = `
        <section class="highlight-card highlight-card--large highlight__sunrise-and-sunset">
        <h4 class="highlight-card__title">sunrise & sunset</h4>
        <div class="highlight-card__data-set">
          <div class="highlight-card__data highlight-card__data--column highlight-card__data--row-above-mobile">
            <img loading="lazy" src="./icons/day-mobile.webp" srcset="./icons/day-mobile.webp 32w, ./icons/day-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Sun icon - Represents sunrise" class="class highlight-card__icon" />
            <p class="highlight-card__label">
              Sunrise
                <time class="highlight-card__value" datetime="${unixTimeToHumanReadable(sunrise, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}">
                  ${unixTimeToHumanReadable(sunrise, {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
              </time>
            </p>
          </div>
          <div class="highlight-card__data highlight-card__data--column highlight-card__data--row-above-mobile">
            <img loading="lazy" src="./icons/night-mobile.webp" srcset="./icons/night-mobile.webp 32w, ./icons/night-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Moon icon - Represents sunset" class="class highlight-card__icon" />
            <p class="highlight-card__label">
              Sunset
              <time class="highlight-card__value" datetime="${unixTimeToHumanReadable(sunset, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}">
                ${unixTimeToHumanReadable(sunset, {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}
              </time>
            </p>
          </div>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return sunComponent;
  },
  /**
   * Builds and returns a HTML string of humidity component with the given humidity value.
   *
   * @param {number} humidity - The humidity value in percentage.
   * @returns {string} - HTML markup for the humidity component.
   */
  buildHumidityComponent(humidity) {
    // Build component and hydrate it with data.
    const humidityComponent = `
      <section class="highlight-card highlight-card--small highlight__humidity">
        <h4 class="highlight-card__title">humidity</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/humidity-mobile.webp" srcset="./icons/humidity-mobile.webp 32w, ./icons/humidity-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Raindrop icon with percent sign inside it - Represents current humidity." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">${humidity}%</p>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return humidityComponent;
  },
  /**
   * Builds and returns a HTML string of pressure component with the given pressure value.
   *
   * @param {number} pressure - The pressure value in hPa (hectopascals).
   * @returns {string} - HTML markup for the pressure component.
   */
  buildPressureComponent(pressure) {
    // Build component and hydrate it with data.
    const pressureComponent = `
      <section class="highlight-card highlight-card--small highlight__pressure">
        <h4 class="highlight-card__title">pressure</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/pressure-mobile.webp" srcset="./icons/pressure-mobile.webp 32w, ./icons/pressure-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Air wave icon - Represents current pressure." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${pressure} hPa
          </p>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return pressureComponent;
  },
  /**
   * Builds and returns a HTML string of visibility component with the given visibility value.
   *
   * @param {number} visibility - The visibility value in meters.
   * @returns {string} - HTML markup for the visibility component.
   */
  buildVisibilityComponent(visibility) {
    // Build component and hydrate it with data.
    const visibilityComponent = `
      <section class="highlight-card highlight-card--small highlight__visibility">
        <h4 class="highlight-card__title">visibility</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/visibility-mobile.webp" srcset="./icons/visibility-mobile.webp 32w, ./icons/visibility-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Eye icon - Represents current visibility." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${visibility / 1000} km
          </p>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return visibilityComponent;
  },
  /**
   * Builds and returns a HTML string of feels-like component with the given feels-like temperature value.
   *
   * @param {number|string} feelsLike - The feels-like temperature value.
   * @returns {string} - HTML markup for the feels-like component.
   */
  buildFeelsLikeComponent(feelsLike) {
    // Build component and hydrate it with data.
    const feelsLikeComponent = `
      <section class="highlight-card highlight-card--small highlight__feels-like">
        <h4 class="highlight-card__title">feels like</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/feels-like-mobile.webp" srcset="./icons/feels-like-mobile.webp 32w, ./icons/feels-like-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Thermometer - Represents what current temperature feels like." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${parseInt(feelsLike, 10)}&#8451;
          </p>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return feelsLikeComponent;
  },
  /**
   * Updates the highlights section of the app with data from the current weather and air quality.
   *
   * @param {Object} currentWeather - The current weather data.
   * @param {Object} airQuality - The air quality data.
   * @returns {void}
   */
  updateHighlights(currentWeather, airQuality) {
    // Pull the data that components needs.
    const {
      main: { feels_like: feelsLike, humidity, pressure },
      sys: { sunrise, sunset },
      visibility,
    } = currentWeather;
    // Get components.
    const airQualityComponent = App.buildAirQualityComponent(airQuality);
    const sunComponent = App.buildSunComponent(sunrise, sunset);
    const humidityComponent = App.buildHumidityComponent(humidity);
    const pressureComponent = App.buildPressureComponent(pressure);
    const visibilityComponent = App.buildVisibilityComponent(visibility);
    const feelsLikeComponent = App.buildFeelsLikeComponent(feelsLike);
    // Build highlights component.
    const highlightsComponent = `
      <h3 class="title section__title">todays highlights</h3>
      <!-- Air Quality section. -->
      ${airQualityComponent}
      <!-- Sunrise and Sunset section. -->
      ${sunComponent}
      <!-- Humidity section. -->
      ${humidityComponent}
      <!-- Pressure section. -->
      ${pressureComponent}
      <!-- Visibility section. -->
      ${visibilityComponent}
      <!-- Feels like section. -->
      ${feelsLikeComponent}
    `;
    // Render component.
    replaceHTML(App.$.highlightsSection, highlightsComponent);
  },
  /**
   * Builds and returns an HTML string for a temperature card for today's forecast.
   *
   * @param {Array} todaysData - An array of forecast data for today.
   * @returns {string} - An HTML string of wind cards for today's forecast.
   */
  buildTodaysTemperatureCards(todaysData) {
    // Build component using the data.
    const todaysTemperatureCards = todaysData
      .map(({ dt: dateUnix, weather: [{ description, icon }], main: { temp } }) => {
        return `
          <li class="today-at-card">
            <time class="today-at-card__label">
              ${unixTimeToHumanReadable(dateUnix, {
                hour: '2-digit',
                hour12: true,
              })}
            </time>
            <img
              loading="lazy"
              src="./icons/weather/${icon}-mobile.webp"
              srcset="
                ./icons/weather/${icon}-mobile.webp 32w,
                ./icons/weather/${icon}-desktop.webp 48w
              "
              sizes="(min-width: 1200px) 48px, 32px"
              alt="${description}"
              class="today-at-card__icon"
            />
            <p class="today-at-card__label">${parseInt(temp, 10)}&#8451;</p>
         </li>
        `;
      })
      .join('');
    // Show it to the world.
    return todaysTemperatureCards;
  },
  /**
   * Builds and returns an HTML string for a wind card for today's forecast.
   *
   * @param {Array} todaysData - An array of forecast data for today.
   * @returns {string} - An HTML string of wind cards for today's forecast.
   */
  buildTodaysWindCards(todaysData) {
    // Build component using the data.
    const todaysWindCards = todaysData
      .map(({ dt: dateUnix, wind: { deg, speed } }) => {
        return `
        <div class="today-at-card">
          <time class="today-at-card__label">
            ${unixTimeToHumanReadable(dateUnix, {
              hour: '2-digit',
              hour12: true,
            })}
          </time>
          <img
            loading="lazy"
            src="./icons/wind-direction-mobile.webp"
            srcset="
              ./icons/wind-direction-mobile.webp 32w,
              ./icons/wind-direction-desktop.webp 48w
            "
            sizes="(min-width: 1200px) 48px, 32px"
            alt=""
            class="today-at-card__icon"
            style="transform: rotate(${deg}deg);"
          />
          <p class="today-at-card__label">${speed} km/h</p>
        </div>
      `;
      })
      .join('');
    // Show it to the world.
    return todaysWindCards;
  },
  /**
   * Updates the "Today At" section with forecast data for the current day.
   *
   * @param {Array} forecast - The forecast data to update the "Today At" section with.
   * @returns {void}
   */
  updateTodayAt(forecast) {
    // Get the current date in Unix time.
    const currentDate = unixTimeToHumanReadable(Math.floor(Date.now() / 1000), {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    // Filter out forecast data to only today's results.
    const todaysData = forecast.filter(
      ({ dt: dateUnix }) =>
        unixTimeToHumanReadable(dateUnix, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }) === currentDate
    );
    // Gather today at cards sprinkled with data.
    const todaysTemperatureCards = App.buildTodaysTemperatureCards(todaysData);
    const todaysWindCards = App.buildTodaysWindCards(todaysData);
    // Render components.
    replaceHTML(App.$.todaysTemperature, todaysTemperatureCards);
    replaceHTML(App.$.todaysWind, todaysWindCards);
  },
  /**
   * Updates the weather that the app shows by fetching current weather, forecast,
   * and air quality data for a specified latitude and longitude.
   *
   * @async
   * @param {object} args - Object that holds query args needed for API operations.
   * @returns {void}
   */
  async updateWeather(args) {
    try {
      // Check if args is an object and is not null
      if (typeof args !== 'object' || args === null) {
        throw new Error('Invalid argument: args must be an object');
      }
      // Check if args has the required properties
      if (!('lat' in args && 'lon' in args)) {
        throw new Error('Invalid argument: args must contain lat and lon properties');
      }
      // Wait for all three promises to resolve and destructure results to separate variables.
      const [currentWeather, { list: forecast }, { list: airQuality }] = await Promise.all([
        WeatherWise.getCurrentWeather(args),
        WeatherWise.getForecast(args),
        WeatherWise.getAirQuality(args),
      ]);
      // Update the app's current weather, forecast, highlights, and today-at sections.
      App.updateCurrentWeather(currentWeather);
      App.updateForecast(forecast);
      App.updateHighlights(currentWeather, airQuality);
      App.updateTodayAt(forecast);
    } catch (error) {
      // Handle any errors that may occur
      console.error(error);
    }
  },
  /**
   * Initializes a new Router instance with the App's `updateWeather` method as the callback
   * function for route changes.
   *
   * @returns {Router} A new Router instance
   */
  handleRouting() {
    return new Router(App.updateWeather);
  },
  /**
   * Attaches event listeners to various elements to enable toggling the search view and clearing the search input.
   *
   * @returns {void}
   */
  handleSearchToggle() {
    /**
     * Toggles search state on search toggle is click.
     */
    delegateEvent(App.$.app, '[data-weather="search-toggle"]', 'click', () => {
      App.$.searchView.classList.toggle('search--open');
      App.$.search.value = '';
      replaceHTML(App.$.searchResults, '');
    });
    /**
     * Clears and closes the search on escape hit.
     */
    App.$.app.addEventListener('keyup', (event) => {
      if (
        (event.key === 'Escape' && App.$.searchView.classList.contains('search--open')) ||
        App.$.searchWrapper.classList.contains('search__wrapper--has-results')
      ) {
        App.clearSearch();
      }
    });
    /**
     * Clears and closes the search on search results item selection.
     */
    delegateEvent(App.$.searchView, '[data-weather="search-results-item"]', 'click', App.clearSearch);
    /**
     * Clears and closes the search on focusout.
     */
    delegateEvent(
      App.$.searchView,
      '[data-weather="search-input"]',
      'focusout', // Blur event does not bubble.
      (event) => {
        // Get HTMLElement which was used during focusout event.
        const relatedTargetElement = event.relatedTarget ?? false;
        // Clear search if there is no related element or if related element is not a search result item.
        if (!relatedTargetElement || !relatedTargetElement.matches('[data-weather="search-results-item"]')) {
          App.clearSearch();
        }
      }
    );
  },
  /**
   * Clears the search field and hides the search view, along with resetting the search results.
   *
   * @returns {void}
   */
  clearSearch() {
    App.$.searchView.classList.remove('search--open');
    App.$.search.value = '';
    App.$.searchWrapper.classList.remove('search__wrapper--has-results');
    replaceHTML(App.$.searchResults, '');
  },
  /**
   * Attaches an event listener to the search input element which triggers the search for
   * geo-locations based on the user's input.
   *
   * @returns {void}
   */
  handleLocationSearch() {
    App.$.search.addEventListener(
      'input',
      debounce(async (event) => {
        if (event.target.value.length) {
          // Gather locations.
          const locations = await WeatherWise.getGeoLocationByQueryString({
            q: event.target.value,
            limit: 5,
          });
          // Update search results with locations.
          App.updateSearchResults(locations);
        }
      }, 500)
    );
  },
  /**
   * Binds app events.
   *
   * @returns {void}
   */
  bindEvents() {
    App.handleRouting();
    App.handleSearchToggle();
    App.handleLocationSearch();
  },
  /**
   * Runs everything that should be invoked on app initialization, including binding events.
   *
   * @returns {void}
   */
  init() {
    App.bindEvents();
  },
};
// Boot the app.
App.init();
