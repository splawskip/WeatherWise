/**
 * Returns the currently used URL hash.
 *
 * @returns {string} The string representation of the currently used URL hash.
 */
export const getURLHash = () => document.location.hash.replace(/^#/, '');

/**
 * Adds the provided event listener to all of the given elements.
 *
 * @param {Array.<HTMLElement>} elements - The elements to which the event listener will be added.
 * @param {string} eventName - The name of the event to listen for.
 * @param {Function} callback - The function to call when the event is triggered on any of the elements.
 * @returns {void}
 */
export const addEventOnElements = (elements, eventName, callback) => {
  elements.forEach((element) => {
    element.addEventListener(eventName, callback);
  });
};

/**
 * Delegates the given event to the provided element using the provided handler function.
 *
 * @param {HTMLElement} el - The element to which the event will be delegated.
 * @param {string} selector - The selector used to identify the target element(s) of the event.
 * @param {string} event - The name of the event to delegate.
 * @param {Function} handler - The function to call when the event is triggered on the target element(s).
 * @returns {void}
 */
export const delegateEvent = (el, selector, event, handler) => {
  el.addEventListener(event, (e) => {
    if (e.target.matches(selector)) handler(e, el);
  });
};

/**
 * Inserts the provided HTML into the given element using the 'afterbegin' position.
 *
 * @param {HTMLElement} el - The element into which to insert the HTML.
 * @param {string} html - The HTML string to insert into the element.
 * @returns {void}
 */
export const insertHTML = (el, html) => el.insertAdjacentHTML('afterbegin', html);

/**
 * Replaces the content of the given element with the provided HTML.
 *
 * @param {HTMLElement} el - The element whose content will be replaced.
 * @param {string} html - The HTML string to use as the new content for the element.
 * @returns {void}
 */
export const replaceHTML = (el, html) => {
  el.replaceChildren();
  insertHTML(el, html);
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} - The debounced function.
 */
export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    /**
     * Invokes `func` after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
     */
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Converts a Unix timestamp to a human-readable date string.
 *
 * @param {number} unixTimestamp - The Unix timestamp (in seconds).
 * @param {Object} [options={}] - An optional object specifying the formatting options to use.
 * @returns {string} - The human-readable date string.
 */
export const unixTimeToHumanReadable = (unixTimestamp, options = {}) =>
  new Intl.DateTimeFormat('en-GB', options).format(new Date(unixTimestamp * 1000));

/**
 * Checks if a given value is empty, undefined, or null.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is empty, undefined, or null, false otherwise.
 */
export const isEmpty = (value) => {
  switch (typeof value) {
    case 'string':
      return value.trim().length === 0;
    case 'number':
      return Number.isNaN(value);
    case 'object':
      if (value === null) {
        return true;
      }
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      if (Object.keys(value).length === 0) {
        return true;
      }
      return false;
    case 'undefined':
      return true;
    default:
      return false;
  }
};

/**
 * Builds and displays an error popup.
 *
 * @param {HTMLElement} popupElement - The popup element to display.
 * @param {object} args - The arguments for the error popup.
 * @param {string} args.errorCode - The error code to display.
 * @param {string} args.errorMessage - The error message to display.
 * @throws {Error} If the popupElement argument is not a valid HTMLElement.
 */
export const buildErrorPopup = (popupElement = null, args = { title: 'Whoops!', message: 'Something went wrong.' }) => {
  // Check if popupElement is a valid HTMLElement.
  if (popupElement && !(popupElement instanceof HTMLElement)) {
    throw new Error('Invalid argument: popupElement must be an HTMLElement.');
  }
  // Check if args is an object.
  if (args !== null && typeof args !== 'object') {
    throw new Error('Invalid argument: args must be an object.');
  }
  // Build popup content.
  const popupContent = `
    <div class="popup__body">
      <h2 class="popup__title">${args.title ?? 'Whoops!'}</h2>
      <p class="popup__desc">${args.message ?? 'Something went wrong.'}</p>
      ${
        args.title !== '404'
          ? `
        <p class="popup__issue">
          Please open new issue here 👉 <a href="https://github.com/splawskip/WeatherWise/issues" target="_blank" rel="noopener noreferrer" class="popup__issue-link">WeatherWise issues board</a>
        </p>`
          : ''
      }
      <a
        href="https://splawskip.github.io/WeatherWise/#/weather?lat=50.193466&lon=19.290104"
        class="btn btn--accent btn--pill popup__btn"
        >go to homescreen</a
      >
    </div>
  `;
  // Hydrate popup with error data and open it if not already opened.
  if (!popupElement.open) {
    replaceHTML(popupElement, popupContent);
    popupElement.showModal();
  }
};

/**
 * Retrieves the HTML entity for the given entity name.
 *
 * @param {string} entityName - The name of the HTML entity.
 * @returns {string} - The corresponding HTML entity, or an empty string if not found.
 */
export const getHTMLEntity = (entityName = '') => {
  // Gather entities.
  const entities = {
    degree: '&deg;',
    celsiusDegree: '&#8451;',
    fahrenheitDegree: '&#8457;',
    kelvingDegree: '&#8490;',
    ellipsis: '&#8230;',
  };
  // Return given entity.
  return entities[entityName] ?? '';
};
