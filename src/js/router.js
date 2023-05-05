import { getURLHash, isEmpty, buildErrorPopup } from './utils';
/**
 * A router class that handles URL routing and route handling.
 */
export class Router {
  /**
   * The default route used if no route is found.
   *
   * @type {string}
   * @private
   */
  #defaultRoute = '#/weather?lat=50.193466&lon=19.290104'; // Jaworzno, PL.

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
    // Assign callback that should be executed on route change.
    this.#onRouteChangeAction = callback;
    // Boot the Router.
    this.boot();
  }

  /**
   * Initializes the Router class by registering routes and handling route changes.
   */
  boot() {
    this.registerRoutes();
    this.handleRouteChangeOnInit();
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
   * Checks the current URL hash and executes the corresponding route handler.
   */
  checkRoute() {
    const queryURL = getURLHash();
    // Get route name and route query args.
    const [route, query] = queryURL.includes('?') ? queryURL.split('?') : [queryURL];
    // If route does not exist show 404 page.
    if (!this.#routes.has(route)) {
      buildErrorPopup(document.querySelector('[data-weather="error-popup"]'), {
        title: '404',
        message: 'location not found',
      });
      return;
    }
    // Execute correct route.
    this.#routes.get(route)(query);
    // Save last used location.
    if (!isEmpty(route) && !isEmpty(query)) {
      localStorage.setItem('lastLocation', `${route}?${query}`);
    }
  }

  /**
   * Handles route change on app init.
   */
  handleRouteChangeOnInit() {
    window.addEventListener('load', () => {
      // If there is no route at all, use last used route or my hometown location.
      if (!window.location.hash) {
        window.location.hash = localStorage.getItem('lastLocation') ?? this.#defaultRoute;
        return;
      }
      // If we got some route on app init check which route should be used.
      this.checkRoute();
    });
  }

  /**
   * Handles route changes by checking the URL hash and executing the corresponding route handler.
   */
  handleRouteChange() {
    window.addEventListener('hashchange', () => {
      this.checkRoute();
    });
  }

  /**
   * Handles the '/weather' route and executes the onRouteChangeAction callback with the latitude and longitude parameters.
   *
   * @param {string} queryString - The query string containing the latitude and longitude parameters.
   */
  handleSearchedLocationRoute = (queryString) => {
    const params = new URLSearchParams(queryString);
    this.#onRouteChangeAction({ lat: params.get('lat'), lon: params.get('lon') });
  };

  /**
   * Handles the '/current-location' route and executes the onRouteChangeAction callback with the current user location coordinates.
   */
  handleCurrentLocationRoute = () => {
    window.navigator.geolocation.getCurrentPosition(
      // Get current coordinates of the user.
      (response) => {
        const { latitude: lat, longitude: lon } = response.coords;
        this.#onRouteChangeAction({ lat, lon });
      },
      // When something went wrong use last used route or my hometown location.
      () => {
        window.location.hash = localStorage.getItem('lastLocation') ?? this.#defaultRoute;
      }
    );
  };
}
