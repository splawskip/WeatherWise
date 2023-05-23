import { MeteoStation } from './meteo-station';
import { Router } from './router';
import { debounce, delegateEvent, replaceHTML, unixTimeToHumanReadable, buildErrorPopup, getHTMLEntity } from './utils';
/**
 * Object that scaffolds the app.
 * Holds configuration variables and methods responsible for app manipulations.
 */
const App = {
  /**
   * Router instance for handling app routing.
   *
   * @typedef {null|Router} Router
   */
  Router: null,
  /**
   * MeteoStation instance for interacting with the weather data.
   *
   * @typedef {null|MeteoStation} MeteoStation
   */
  MeteoStation: null,
  /**
   * Object that defines the breakpoints used by the app.
   *
   * @property {number} xs - The extra-small breakpoint.
   * @property {number} sm - The small breakpoint.
   * @property {number} md - The medium breakpoint.
   * @property {number} lg - The large breakpoint.
   * @property {number} xl - The extra-large breakpoint.
   */
  breakpoints: {
    xs: 0,
    sm: 320,
    md: 768,
    lg: 1200,
    xl: 1600,
  },
  /**
   * Object that holds references to various DOM elements used by the app.
   *
   * @property {HTMLElement} body - The body element.
   * @property {HTMLElement} app - The app element.
   * @property {HTMLElement} content - The content element.
   * @property {HTMLElement} searchLoader - The search loader element.
   * @property {HTMLElement} errorPopup - The error popup element.
   * @property {HTMLElement} search - The search element.
   * @property {HTMLElement} searchInput - The search input element.
   * @property {HTMLElement} searchResults - The search results element.
   */
  $: {
    body: document.body,
    app: document.querySelector('[data-weather="app"]'),
    content: document.querySelector('[data-weather="content"]'),
    searchLoader: document.querySelector('[data-weather="search-loader"]'),
    errorPopup: document.querySelector('[data-weather="error-popup"]'),
    search: document.querySelector('[data-weather="search"]'),
    searchInput: document.querySelector('[data-weather="search-input"]'),
    searchResults: document.querySelector('[data-weather="search-results"]'),
  },
  /**
   * Builds search results component sprinkled with locations data.
   *
   * @param {array} locations - Array that holds locations.
   * @returns {string} - HTML markup for the search results component.
   */
  buildSearchResultsComponent(locations) {
    // Hide loader so user will know that location lookup is over.
    setTimeout(() => {
      App.toggleSearchLoadingState();
    }, 500);
    // Early return if there are not any locations.
    if (!locations.length) {
      App.$.search.classList.remove('search--has-results');
      return '';
    }
    // Indicate that the search results has results.
    App.$.search.classList.add('search--open');
    App.$.search.classList.add('search--has-results');
    // Loop over locations data and build search results component that is sprinkled with the location data.
    const searchResultsComponent = `
      <ul class="search__results-list" data-weather="search-results-list">
        ${locations
          .map(({ name, state, country, lat, lon }) => {
            return `
              <li class="search__results-item">
                <a href="#/weather?lat=${lat}&lon=${lon}" class="search__results-item-link" data-weather="search-results-item">
                  <svg xmlns="http://www.w3.org/2000/svg" class="search__results-item-icon" viewBox="0 0 16 20">
                    <path
                      d="M8 9.925c.533 0 .992-.188 1.375-.563.383-.375.575-.829.575-1.362 0-.533-.192-.992-.575-1.375A1.876 1.876 0 0 0 8 6.05c-.533 0-.987.192-1.362.575A1.896 1.896 0 0 0 6.075 8c0 .533.188.987.563 1.362.375.375.829.563 1.362.563Zm0 7.5c2.05-1.883 3.575-3.592 4.575-5.125s1.5-2.9 1.5-4.1c0-1.85-.588-3.358-1.763-4.525C11.137 2.508 9.7 1.925 8 1.925c-1.7 0-3.133.583-4.3 1.75C2.533 4.842 1.95 6.35 1.95 8.2c0 1.2.496 2.567 1.488 4.1.991 1.533 2.512 3.242 4.562 5.125Zm0 2.125a1.13 1.13 0 0 1-.362-.062A1.04 1.04 0 0 1 7.3 19.3c-2.433-2.15-4.246-4.142-5.437-5.975C.671 11.492.075 9.783.075 8.2c0-2.483.796-4.463 2.388-5.938C4.054.787 5.9.05 8 .05s3.95.737 5.55 2.212c1.6 1.475 2.4 3.455 2.4 5.938 0 1.583-.6 3.292-1.8 5.125-1.2 1.833-3.017 3.825-5.45 5.975a.79.79 0 0 1-.312.188A1.232 1.232 0 0 1 8 19.55Z"
                    />
                  </svg>
                  <span class="search__results-item-data">
                    <h3 class="search__results-item-city">${name}</h3>
                    <p class="search__results-item-country">${state}, ${country}</p>
                  </span>
                </a>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
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
   * Builds the current weather component sprinkled with current weather data.
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
      <!-- Current weather section -->
      <section class="section current-weather-card" data-weather="current-weather-section">
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
      </section>
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
    const forecastComponent = `
      <!-- Five days forecast section -->
      <section class="section forecast-section">
        <h3 class="title section__title forecast-section__title">
          5 days forecast
        </h3>
        <section class="forecast-section__card forecast-card" data-weather="forecast-section">
          ${forecast
            .filter((_, index) => (index + 1) % 8 === 0)
            .map(({ weather: [{ icon, description }], dt: dateUnix, main: { temp_max: tempMax } }) => {
              return `
              <div class="forecast-card__day-forecast">
                <p class="forecast-card__temperatures">
                  <img loading="lazy" src="./icons/weather/${icon}-mobile.webp" srcset="./icons/weather/${icon}-mobile.webp 32w, ./icons/weather/${icon}-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" title="${description}" alt="${description}" class="forecast-card__icon" />
                  <span class="forecast-card__day-temperature">
                    ${parseInt(tempMax, 10)}${getHTMLEntity('degree')}
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
            .join('')}
        </section>
      </section>
      `;
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
    // Pull only needed data from the object.
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
          <li class="today-at-card">
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
          </li>
        `;
      })
      .join('');
    // Return component as HTML string.
    return followingHoursWindCards;
  },
  /**
   * Builds the highlights component.
   *
   * @param {Object} currentWeather - The current weather data.
   * @param {Object} airQuality - The air quality data.
   * @returns {string} - HTML markup for the highlights component.
   */
  buildHighlightsComponent(currentWeather, airQuality) {
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
      <!-- Todays weather highlights section -->
      <section class="section highlights-section highlights section--highlights" data-weather="highlights-section">
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
      </section>
    `;
    // Render component as HTML string.
    return highlightsComponent;
  },
  /**
   * Builds the following hours component.
   *
   * @param {Array} forecast - The forecast data.
   * @returns {string} - HTML markup for the following hours component.
   */
  buildFollowingHoursComponent(forecast) {
    // Filter out forecast data to get only data about following 24 hours.
    const followingHoursForecast = forecast.filter((_, index) => index < 8);
    // Gather following hours cards sprinkled with the forecast data.
    const followingHoursTemperatureCards = App.buildFollowingHoursTemperatureCards(followingHoursForecast);
    const followingHoursWindCards = App.buildFollowingHoursWindCards(followingHoursForecast);
    // Build following hours component.
    const followingHoursComponent = `
      <!-- Following hours section. -->
      <section class="section following-hours-section" data-weather="following-hours-section">
        <h3 class="title section__title">in the following hours</h3>
        <div class="scrollable-container scrollable-container--horizontal">
          <ul class="grid grid--columns-8" data-weather="following-hours-temperature">
          ${followingHoursTemperatureCards}
          </ul>
          <ul class="grid grid--columns-8" data-weather="following-hours-wind">
          ${followingHoursWindCards}
          </ul>
        </div>
      </section>
    `;
    // Render component as HTML string.
    return followingHoursComponent;
  },
  /**
   * Toggles the loading state of the app content.
   *
   * @returns {void}
   */
  toggleContentLoadingState() {
    App.$.content.classList.toggle('content--loading');
  },
  /**
   * Renders the content of the application.
   *
   * @param {object} currentWeather - The current weather data.
   * @param {object} forecast - The forecast data.
   * @param {object} airQuality - The air quality data.
   * @returns {void}
   */
  renderContent(currentWeather, forecast, airQuality) {
    // Show loader if not already loading.
    if (!App.$.content.classList.contains('content--loading')) {
      App.toggleContentLoadingState();
    }
    // Gather App components.
    const currentWeatherComponent = App.buildCurrentWeatherComponent(currentWeather);
    const forecastComponent = App.buildForecastComponent(forecast);
    const highlightsComponent = App.buildHighlightsComponent(currentWeather, airQuality);
    const followingHoursComponent = App.buildFollowingHoursComponent(forecast);
    // Build content component.
    const contentComponent = `
      <!-- Left side of the content. -->
      <div class="content__left">
        ${currentWeatherComponent}
        ${forecastComponent}
      </div>
      <!-- Right side of the content. -->
      <div class="content__right">
        ${highlightsComponent}
        ${followingHoursComponent}
      </div>`;
    // Render the app under the loader.
    replaceHTML(App.$.content, contentComponent);
    // Hide loader after some time cuz we fast 🏎.
    setTimeout(() => {
      App.toggleContentLoadingState();
    }, 200);
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
    // Try to show weather.
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
        App.MeteoStation.getCurrentWeather(args),
        App.MeteoStation.getForecast(args),
        App.MeteoStation.getAirQuality(args),
      ]);
      // Render the app.
      App.renderContent(currentWeather, forecast, airQuality);
    } catch (error) {
      // Inform user that something went wrong.
      buildErrorPopup(App.$.errorPopup, { title: error.name, message: error.message });
    }
  },
  /**
   * Prevents the popup from closing when the escape key is hit.
   *
   * @returns {void}
   */
  preventPopupClosing() {
    App.$.errorPopup.addEventListener('cancel', (event) => {
      event.preventDefault();
    });
  },
  /**
   * Clears the search field and hides the search view, along with resetting the search results.
   *
   * @returns {void}
   */
  clearSearch() {
    App.$.search.classList.remove('search--open');
    App.$.search.classList.remove('search--has-results');
    App.$.body.classList.remove('body--no-scroll');
    App.$.searchInput.value = '';
    replaceHTML(App.$.searchResults, '');
  },
  /**
   * Toggles the loading state of the search input.
   *
   * @returns {void}
   */
  toggleSearchLoadingState() {
    App.$.searchLoader.classList.toggle('loader--hidden');
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
    App.$.searchInput.addEventListener(
      'input',
      debounce(async (event) => {
        if (event.target.value.length) {
          // Show loader so user will know that we are looking for the locations.
          App.toggleSearchLoadingState();
          // Gather locations.
          const locations = await App.MeteoStation.getGeoLocationByQueryString({
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
      App.$.search.classList.toggle('search--open');
      App.$.body.classList.toggle('body--no-scroll');
      App.$.searchInput.value = '';
      replaceHTML(App.$.searchResults, '');
    });
    /**
     * Clears the search on search results item selection.
     */
    delegateEvent(App.$.search, '[data-weather="search-results-item"]', 'click', App.clearSearch);
    /**
     * Clears the search using keyboard.
     */
    App.$.body.addEventListener('keyup', (event) => {
      // Get if search has results.
      const hasResults =
        App.$.search.classList.contains('search--open') && App.$.search.classList.contains('search--has-results');
      // Clear search if user want to close it using escape key.
      if (hasResults && event.key === 'Escape') {
        App.clearSearch();
      }
      // Clear search if user tabbed out from it.
      if (
        hasResults &&
        event.key === 'Tab' &&
        window.innerWidth >= App.breakpoints.lg &&
        !App.$.search.contains(event.target)
      ) {
        App.clearSearch();
      }
    });
    /**
     * Clears the search on click outside search element on desktop.
     */
    App.$.body.addEventListener('click', (event) => {
      if (window.innerWidth >= App.breakpoints.lg && !App.$.search.contains(event.target)) {
        App.clearSearch();
      }
    });
  },
  /**
   * Binds app events.
   *
   * @returns {void}
   */
  bindEvents() {
    App.handleSearchEvents();
    App.preventPopupClosing();
  },
  /**
   * Sets a Router instance for this instance of the app.
   *
   * @returns {void}
   */
  setRouter() {
    App.Router = new Router(App.updateWeather);
  },
  /**
   * Sets a MeteoStation instance for this instance of the app.
   *
   * @returns {void}
   */
  setMeteoStation() {
    App.MeteoStation = new MeteoStation();
  },
  /**
   * Sets the instances of other classes used by the app.
   *
   * @returns {void}
   */
  setInstances() {
    App.setRouter();
    App.setMeteoStation();
  },
  /**
   * Runs everything that should be invoked on app initialization, including binding events.
   *
   * @returns {void}
   */
  init() {
    App.setInstances();
    App.bindEvents();
  },
};
// Boot the app.
App.init();
