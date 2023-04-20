import { getURLHash } from './utils';
/**
 * A router class that handles URL routing and route handling.
 */
export class Router {
  /**
   * The default URL hash used if no route is found.
   *
   * @type {string}
   * @private
   */
  #defaultLocation = '#/weather?lat=50.193466&lon=19.290104'; // Jaworzno.

  /**
   * A map of registered routes and their corresponding handlers.
   *
   * @type {Map<string, Function>}
   * @private
   */
  #routes;

  /**
   * The action to be performed when a route change occurs.
   *
   * @type {Function}
   * @private
   */
  #onRouteChangeAction;

  /**
   * Constructs a new Router instance with the given onRouteChangeAction callback.
   *
   * @param {Function} callback - The callback function to be executed on route change.
   */
  constructor(callback) {
    this.#onRouteChangeAction = callback;
    // Boot the class.
    this.boot();
  }

  /**
   * Initializes the Router class by registering routes and handling route changes.
   */
  boot() {
    this.registerRoutes();
    this.handleRouteChange();
  }

  /**
   * Registers the available routes and their corresponding handlers.
   */
  registerRoutes() {
    this.#routes = new Map([
      ['/current-location', this.handleCurrentLocationRoute],
      ['/weather', this.handleSearchedLocationRoute],
    ]);
  }

  /**
   * Handles route changes by checking the URL hash and executing the corresponding route handler.
   */
  handleRouteChange() {
    window.addEventListener('hashchange', () => {
      // Check if we got any route.
      if (!window.location.hash) {
        window.location.hash = '#/current-location';
        return;
      }
      // Check if we should change current route.
      this.checkRoute();
    });
  }

  /**
   * Checks the current URL hash and executes the corresponding route handler.
   */
  checkRoute() {
    const queryURL = getURLHash();
    const [route, query] = queryURL.includes('?')
      ? queryURL.split('?')
      : [queryURL];
    this.#routes.get(route)(query);
  }

  /**
   * Handles the '/weather' route and executes the onRouteChangeAction callback with the latitude and longitude parameters.
   *
   * @param {string} queryString - The query string containing the latitude and longitude parameters.
   */
  handleSearchedLocationRoute = (queryString) => {
    const params = new URLSearchParams(queryString);
    this.#onRouteChangeAction(params.get('lat'), params.get('lon'));
  };

  /**
   * Handles the '/current-location' route and executes the onRouteChangeAction callback with the current user location coordinates.
   */
  handleCurrentLocationRoute = () => {
    window.navigator.geolocation.getCurrentPosition(
      (res) => {
        const { latitude, longitude } = res.coords;
        this.#onRouteChangeAction(latitude, longitude);
      },
      (error) => {
        console.error(error);
        window.location.hash = this.#defaultLocation;
      }
    );
  };
}
