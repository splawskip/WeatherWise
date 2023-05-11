import { MeteoStation } from './meteo-station';
import { Router } from './router';
import { debounce, delegateEvent, replaceHTML, unixTimeToHumanReadable, buildErrorPopup, getHTMLEntity } from './utils';
// Settle WeatherWise Meteo Station.
const WeatherWise = new MeteoStation();
// Build the app.
const App = {
  /** Gather app components. */
  $: {
    /** App misc components. */
    app: document.querySelector('[data-weather="app"]'),
    errorPopup: document.querySelector('[data-weather="error-popup"]'),
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
    followingHoursSection: document.querySelector('[data-weather="following-hours-section"]'),
    followingHoursTemperature: document.querySelector('[data-weather="following-hours-temperature"]'),
    followingHoursWind: document.querySelector('[data-weather="following-hours-wind"]'),
  },
  /**
   * Builds search results component sprinkled with locations data.
   *
   * @param {array} locations - Array that holds locations.
   * @returns {void}
   */
  buildSearchResultsComponent(locations) {
    // Early return if there are not any locations.
    if (!locations.length) {
      App.$.searchWrapper.classList.remove('search__wrapper--has-results');
      return '';
    }
    // Indicate that the search results has results.
    App.$.searchWrapper.classList.add('search__wrapper--has-results');
    // Loop over locations data and build search results component that is sprinkled with the location data.
    const searchResultsComponent = locations
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
    // Return component as HTML string.
    return searchResultsComponent;
  },
  /**
   * Renders the search results component sprinkled with locations data.
   *
   * @param {array} locations - Array that holds locations data.
   * @returns {void}
   */
  renderSearchResultsComponent(locations) {
    // Get search results component.
    const searchResultsComponent = App.buildSearchResultsComponent(locations);
    // Render search results component.
    replaceHTML(App.$.searchResults, searchResultsComponent);
  },
  /**
   * Builds the current weather component sprinkled with data about current weather.
   *
   * @param {object} currentWeather - Object that contains data about current weather.
   * @returns {string} - HTML markup for the current weather component.
   */
  buildCurrentWeatherComponent(currentWeather) {
    // Pull out the required data from main object to build the component.
    const {
      weather: [{ description, icon }],
      dt: dateUnix,
      sys: { country },
      main: { temp },
      name: city,
    } = currentWeather;
    // Build component.
    const currentWeatherComponent = `
      <h3 class="title section__title current-weather-card__title">Now</h3>
      <p class="current-weather-card__details">
        <span class="current-weather-card__temperature">
          ${parseInt(temp, 10)}
          <span class="current-weather-card__temperature-unit">
            ${getHTMLEntity('celsiusDegree')}
          </span>
        </span>
        <img loading="lazy" src="./icons/weather/${icon}-desktop.webp" title="${description}" alt="${description}" class="current-weather-card__icon" />
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
    `;
    // Return component as HTML string.
    return currentWeatherComponent;
  },
  /**
   * Builds the forecast component sprinkled with forecast data.
   *
   * @param {object} forecast - Object that contains data about weather forecast.
   * @returns {string} - HTML markup for the forecast component.
   */
  buildForecastComponent(forecast) {
    // Build forecast component.
    const forecastComponent = forecast
      .filter((_, index) => (index + 1) % 8 === 0)
      .map(({ weather: [{ icon, description }], dt: dateUnix, main: { temp_max: tempMax, temp_min: tempMin } }) => {
        return `
              <div class="forecast-card__day-forecast">
                <p class="forecast-card__temperatures">
                  <img loading="lazy" src="./icons/weather/${icon}-mobile.webp" srcset="./icons/weather/${icon}-mobile.webp 32w, ./icons/weather/${icon}-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" title="${description}" alt="${description}" class="forecast-card__icon" />
                  <span class="forecast-card__day-temperature">
                    ${parseInt(tempMax, 10)}${getHTMLEntity('degree')}
                  </span>
                  <span class="forecast-card__night-temperature">
                    ${parseInt(tempMin, 10)}${getHTMLEntity('degree')}
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
    // Return component as HTML string.
    return forecastComponent;
  },
  /**
   * Builds the air quality component sprinkled with air quality data.
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
   * Builds the solar component sprinkled with data about solar information.
   *
   * @param {number} sunrise - UNIX timestamp of the sunrise time.
   * @param {number} sunset - UNIX timestamp of the sunset time.
   * @returns {string} - HTML markup for the solar data component.
   */
  buildSolarDataComponent(sunrise, sunset) {
    // Build component and hydrate it with data.
    const SolarDataComponent = `
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
          <div class="highlight-card__data highlight-card__data--column highlight-card__data--row-above-mobile highlight-card__data--align-right">
            <img loading="lazy" src="./icons/night-mobile.webp" srcset="./icons/night-mobile.webp 32w, ./icons/night-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Moon icon - Represents sunset" class="class highlight-card__icon" />
            <p class="highlight-card__label highlight-card__label--align-right">
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
    return SolarDataComponent;
  },
  /**
   * Builds the humidity component sprinkled with humidity data.
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
   * Builds the pressure component sprinkled with pressure data.
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
   * Builds the visibility component sprinkled with visibility data.
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
   * Builds the feels like component sprinkled with feels like data.
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
            ${parseInt(feelsLike, 10)}${getHTMLEntity('celsiusDegree')}
          </p>
        </div>
      </section>
    `;
    // Return component as HTML string.
    return feelsLikeComponent;
  },
  /**
   * Builds following hours temperature cards components sprinkled with following hours forecast.
   *
   * @param {Array} forecast - An array of forecast data for today.
   * @returns {string} - HTML markup for the today's temperature cards components.
   */
  buildFollowingHoursTemperatureCards(forecast) {
    // Build component using today's forecast.
    const followingHoursTemperatureCards = forecast
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
              title="${description}"
              alt="${description}"
              class="today-at-card__icon"
            />
            <p class="today-at-card__label">${parseInt(temp, 10)}${getHTMLEntity('celsiusDegree')}</p>
         </li>
        `;
      })
      .join('');
    // Return component as HTML string.
    return followingHoursTemperatureCards;
  },
  /**
   * Builds following hours wind cards components sprinkled with following hours forecast.
   *
   * @param {Array} forecast - An array of forecast data for today.
   * @returns {string} - HTML markup for the today's wind cards components.
   */
  buildFollowingHoursWindCards(forecast) {
    // Build component using today's forecast.
    const followingHoursWindCards = forecast
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
    // Return component as HTML string.
    return followingHoursWindCards;
  },
  /**
   * Renders the current weather section with the weather data for a given latitude and longitude.
   *
   * @param {object} forecast - Object that contains data about curren weather.
   * @returns {void}
   */
  renderCurrentWeatherComponent(currentWeather) {
    // Get current weather component.
    const currentWeatherComponent = App.buildCurrentWeatherComponent(currentWeather);
    // Render component.
    replaceHTML(App.$.currentWeatherSection, currentWeatherComponent);
  },
  /**
   * Renders the current weather section with the weather data for a given latitude and longitude.
   *
   * @param {object} forecast - Object that contains data about curren weather.
   * @returns {void}
   */
  renderForecastComponent(forecast) {
    // Get forecast component.
    const forecastComponent = App.buildForecastComponent(forecast);
    // Render component sprinkled by forecast data.
    replaceHTML(App.$.forecastSection, forecastComponent);
  },
  /**
   * Renders the highlights section of the app with data from the current weather and air quality.
   *
   * @param {Object} currentWeather - The current weather data.
   * @param {Object} airQuality - The air quality data.
   * @returns {void}
   */
  renderHighlightsComponent(currentWeather, airQuality) {
    // Pull the data that components needs.
    const {
      main: { feels_like: feelsLike, humidity, pressure },
      sys: { sunrise, sunset },
      visibility,
    } = currentWeather;
    // Get components.
    const airQualityComponent = App.buildAirQualityComponent(airQuality);
    const SolarDataComponent = App.buildSolarDataComponent(sunrise, sunset);
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
        ${SolarDataComponent}
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
   * Renders following hours component sprinkled with forecast data for next 24 hours.
   *
   * @param {Array} forecast - The forecast data.
   * @returns {void}
   */
  renderFollowingHoursComponent(forecast) {
    // Filter out forecast data to get only data about following 24 hours.
    const followingHoursForecast = forecast.filter((_, index) => index < 8);
    // Gather following hours cards sprinkled with the forecast data.
    const followingHoursTemperatureCards = App.buildFollowingHoursTemperatureCards(followingHoursForecast);
    const followingHoursWindCards = App.buildFollowingHoursWindCards(followingHoursForecast);
    // Render components.
    replaceHTML(App.$.followingHoursTemperature, followingHoursTemperatureCards);
    replaceHTML(App.$.followingHoursWind, followingHoursWindCards);
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
        throw new Error('Invalid argument: args must contain lat and lon properties of type number');
      }
      // Wait for all three promises to resolve and destructure results to separate variables.
      const [currentWeather, { list: forecast }, { list: airQuality }] = await Promise.all([
        WeatherWise.getCurrentWeather(args),
        WeatherWise.getForecast(args),
        WeatherWise.getAirQuality(args),
      ]);
      // Render the app.
      App.renderCurrentWeatherComponent(currentWeather);
      App.renderForecastComponent(forecast);
      App.renderHighlightsComponent(currentWeather, airQuality);
      App.renderFollowingHoursComponent(forecast);
    } catch (error) {
      // Inform user that something went wrong.
      buildErrorPopup(App.$.errorPopup, { title: error.name, message: error.message });
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
   * Prevents popup from closing on escape hit.
   *
   * @returns {void}
   */
  preventPopupClosing() {
    App.$.errorPopup.addEventListener('cancel', (event) => {
      event.preventDefault();
    });
  },
  /**
   * Attaches event listeners to various elements to enable toggling the search view and clearing the search input.
   *
   * @returns {void}
   */
  handleSearchEvents() {
    /**
     * Attaches an event listener to the search input element which triggers the search for
     * geo-locations based on the user's input.
     */
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
          App.renderSearchResultsComponent(locations);
        }
      }, 500)
    );
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
        event.key === 'Escape' &&
        App.$.searchView.classList.contains('search--open') &&
        App.$.searchWrapper.classList.contains('search__wrapper--has-results')
      ) {
        App.clearSearch();
      }
    });
    /**
     * Clears and closes the search on search results item selection.
     */
    delegateEvent(App.$.searchView, '[data-weather="search-results-item"]', 'click', (event) => {
      // Prevent from default behavior.
      event.preventDefault();
      // Change the hash.
      window.location.hash = event.target.hash ?? '';
      // Bail search.
      App.clearSearch();
    });
    /**
     * Clears and closes the search on focusout (blur does not bubble).
     */
    document.addEventListener('focusout', (event) => {
      // Get element that is responsible for focusout event.
      const elementThatCausedFocusout = event.relatedTarget;
      // If element that caused focusout event is search results item or search-input, escape the callback.
      if (
        !(elementThatCausedFocusout instanceof Element) ||
        elementThatCausedFocusout.matches('[data-weather="search-results-item"]') ||
        elementThatCausedFocusout.matches('[data-weather="search-input"]')
      ) {
        return;
      }
      // Bail search if some other element caused focusout event.
      App.clearSearch();
    });
  },
  /**
   * Clears the search field and hides the search view, along with resetting the search results.
   *
   * @returns {void}
   */
  clearSearch() {
    App.$.searchView.classList.remove('search--open');
    App.$.searchWrapper.classList.remove('search__wrapper--has-results');
    App.$.search.value = '';
    replaceHTML(App.$.searchResults, '');
  },
  /**
   * Binds app events.
   *
   * @returns {void}
   */
  bindEvents() {
    App.handleRouting();
    App.handleSearchEvents();
    App.preventPopupClosing();
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
