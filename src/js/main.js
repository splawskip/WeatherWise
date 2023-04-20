import { MeteoStation } from './meteo-station';
import { Router } from './router';
import {
  addEventOnElements,
  debounce,
  replaceHTML,
  unixTimeToHumanReadable,
} from './utils';
// Settle WeatherWise Meteo Station.
const WeatherWise = new MeteoStation();
// Build the app.
const App = {
  /** Gather selectors. */
  $: {
    /** Search components */
    search: document.querySelector('[data-weather="search-input"]'),
    searchView: document.querySelector('[data-weather="search-view"]'),
    searchWrapper: document.querySelector('[data-weather="search-wrapper"]'),
    searchResults: document.querySelector('[data-weather="search-results"]'),
    searchViewToggles: document.querySelectorAll(
      '[data-weather="search-toggle"]'
    ),
    /** Current location btn */
    currentLocationBtn: document.querySelector(
      '[data-weather="current-location"]'
    ),
    /** App sections */
    currentWeatherSection: document.querySelector(
      '[data-weather="current-weather-section"]'
    ),
  },
  async updateSearchResults(data) {
    const locations = await data;
    if (!locations.length) {
      return;
    }
    App.$.searchWrapper.classList.add('search__wrapper--has-results');
    locations.forEach((location) => {
      replaceHTML(
        App.$.searchResults,
        `<li class="search__results-item">
				<svg xmlns="http://www.w3.org/2000/svg" class="search__results-item-icon" viewBox="0 0 16 20">
					<path
						d="M8 9.925c.533 0 .992-.188 1.375-.563.383-.375.575-.829.575-1.362 0-.533-.192-.992-.575-1.375A1.876 1.876 0 0 0 8 6.05c-.533 0-.987.192-1.362.575A1.896 1.896 0 0 0 6.075 8c0 .533.188.987.563 1.362.375.375.829.563 1.362.563Zm0 7.5c2.05-1.883 3.575-3.592 4.575-5.125s1.5-2.9 1.5-4.1c0-1.85-.588-3.358-1.763-4.525C11.137 2.508 9.7 1.925 8 1.925c-1.7 0-3.133.583-4.3 1.75C2.533 4.842 1.95 6.35 1.95 8.2c0 1.2.496 2.567 1.488 4.1.991 1.533 2.512 3.242 4.562 5.125Zm0 2.125a1.13 1.13 0 0 1-.362-.062A1.04 1.04 0 0 1 7.3 19.3c-2.433-2.15-4.246-4.142-5.437-5.975C.671 11.492.075 9.783.075 8.2c0-2.483.796-4.463 2.388-5.938C4.054.787 5.9.05 8 .05s3.95.737 5.55 2.212c1.6 1.475 2.4 3.455 2.4 5.938 0 1.583-.6 3.292-1.8 5.125-1.2 1.833-3.017 3.825-5.45 5.975a.79.79 0 0 1-.312.188A1.232 1.232 0 0 1 8 19.55Z"
					/>
				</svg>
				<span class="search__results-item-data">
				<h3 class="search__results-item-city">${location.name}</h3>
				<p class="search__results-item-country">${location.state || ''}, ${
          location.country
        }</p>
				</span>
				<a href="#/weather?lat=${location.lat}&lon=${
          location.lon
        }" class="search__results-item-link">
				</a>
		</li>`
      );
    });
  },
  async updateCurrentWeather(lat, lon) {
    const {
      weather,
      dt: dateUnix,
      sys: { country },
      main: { temp },
      name: city,
    } = await WeatherWise.getCurrentWeather(lat, lon);
    const [{ description, icon }] = weather;
    replaceHTML(
      App.$.currentWeatherSection,
      `
			<h3 class="title section__title current-weather-card__title">Now</h3>
			<p class="current-weather-card__details">
				<span class="current-weather-card__temperature">${parseInt(temp, 10)}</span>
				<img loading="lazy" src="/icons/weather/${icon}.webp" alt="Icons that represents todays weather as ${description}" class="current-weather__icon" />
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
  updateWeather(lat, lon) {
    App.updateCurrentWeather(lat, lon);
  },
  handleRouting() {
    return new Router(App.updateWeather);
  },
  handleSearchToggle() {
    addEventOnElements(App.$.searchViewToggles, 'click', () => {
      App.$.searchView.classList.toggle('search--open');
    });
  },
  handleLocationSearch() {
    App.$.search.addEventListener(
      'input',
      debounce((event) => {
        if (event.target.value.length) {
          App.updateSearchResults(
            WeatherWise.getGeoLocationByQueryString(event.target.value)
          );
        }
      }, 500)
    );
  },
  bindEvents() {
    App.handleRouting();
    App.handleLocationSearch();
    App.handleSearchToggle();
  },
  init() {
    App.bindEvents();
  },
};
// Boot the app.
App.init();
