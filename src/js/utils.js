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
  new Intl.DateTimeFormat('en-US', options).format(new Date(unixTimestamp * 1000));
