var O=Object.defineProperty;var M=(t,e,s)=>e in t?O(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var L=(t,e,s)=>(M(t,typeof e!="symbol"?e+"":e,s),s),E=(t,e,s)=>{if(!e.has(t))throw TypeError("Cannot "+s)};var n=(t,e,s)=>(E(t,e,"read from private field"),s?s.call(t):e.get(t)),l=(t,e,s)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,s)},S=(t,e,s,a)=>(E(t,e,"write to private field"),a?a.call(t,s):e.set(t,s),s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();const D=()=>document.location.hash.replace(/^#/,""),I=(t,e,s,a)=>{t.addEventListener(s,r=>{r.target.matches(e)&&a(r,t)})},N=(t,e)=>t.insertAdjacentHTML("afterbegin",e),m=(t,e)=>{t.replaceChildren(),N(t,e)},z=(t,e)=>{let s;return function(...r){const o=()=>{clearTimeout(s),t(...r)};clearTimeout(s),s=setTimeout(o,e)}},h=(t,e={})=>new Intl.DateTimeFormat("en-GB",e).format(new Date(t*1e3)),P=t=>{switch(typeof t){case"string":return t.trim().length===0;case"number":return Number.isNaN(t);case"object":return t===null?!0:Array.isArray(t)?t.length===0:Object.keys(t).length===0;case"undefined":return!0;default:return!1}},R=(t=null,e={title:"Whoops!",message:"Something went wrong."})=>{if(t&&!(t instanceof HTMLElement))throw new Error("Invalid argument: popupElement must be an HTMLElement.");if(e!==null&&typeof e!="object")throw new Error("Invalid argument: args must be an object.");const s=`
    <div class="popup__body">
      <h2 class="popup__title">${e.title??"Whoops!"}</h2>
      <p class="popup__desc">${e.message??"Something went wrong."}</p>
      ${e.title!=="404"?`
        <p class="popup__issue">
          Please open new issue here 👉 <a href="https://github.com/splawskip/WeatherWise/issues" target="_blank" rel="noopener noreferrer" class="popup__issue-link">WeatherWise issues board</a>
        </p>`:""}
      <a
        href="https://splawskip.github.io/WeatherWise/#/weather?lat=50.193466&lon=19.290104"
        class="btn btn--accent btn--pill popup__btn"
        >go to homescreen</a
      >
    </div>
  `;t.open||(document.body.classList.add("body--no-scroll"),m(t,s),t.showModal())},w=(t="")=>({degree:"&deg;",celsiusDegree:"&#8451;",fahrenheitDegree:"&#8457;",kelvingDegree:"&#8490;",ellipsis:"&#8230;"})[t]??"";var b,d,y,f,$,C,v;class T{constructor(){l(this,b,"380c736aa5d1125df5cc1b66127b1134");l(this,d,"https://api.openweathermap.org/");l(this,y,"data/2.5/weather");l(this,f,"data/2.5/forecast");l(this,$,"data/2.5/air_pollution");l(this,C,"geo/1.0/direct");l(this,v,"geo/1.0/reverse")}async call(e="",s={}){try{if(typeof e!="string"||e.trim().length===0)throw new Error("URL must be a non-empty string.");if(typeof s!="object"||s===null)throw new Error("Args must be an object.");if(Object.keys(s).length===0)throw new Error("Args must not be an empty object.");const a=new URL(e);return a.search=new URLSearchParams({...s,appid:n(this,b),units:"metric"}),await(await fetch(a,{method:"GET"})).json()}catch(a){return R(document.querySelector('[data-weather="error-popup"]'),{title:a.name,message:a.message}),a}}getGeoLocationByQueryString(e){return this.call(`${n(this,d)}${n(this,C)}`,e)}getGeoLocationByCoordinates(e){return this.call(`${n(this,d)}${n(this,v)}`,e)}getCurrentWeather(e){return this.call(`${n(this,d)}${n(this,y)}`,e)}getForecast(e){return this.call(`${n(this,d)}${n(this,f)}`,e)}getAirQuality(e){return this.call(`${n(this,d)}${n(this,$)}`,e)}static getAirQualityData(e){return{1:{quality:"Good",description:"Air quality is considered satisfactory, and air pollution poses little or no risk."},2:{quality:"Fair",description:"Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."},3:{quality:"Moderate",description:"Members of sensitive groups may experience health effects. The general public is not likely to be affected."},4:{quality:"Poor",description:"Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."},5:{quality:"Very Poor",description:"Health warnings of emergency conditions. The entire population is more likely to be affected."}}[e]}}b=new WeakMap,d=new WeakMap,y=new WeakMap,f=new WeakMap,$=new WeakMap,C=new WeakMap,v=new WeakMap;var _,p,g;class F{constructor(e){l(this,_,"#/weather?lat=50.193466&lon=19.290104");l(this,p,void 0);l(this,g,void 0);L(this,"handleSearchedLocationRoute",e=>{const s=new URLSearchParams(e);n(this,g).call(this,{lat:s.get("lat"),lon:s.get("lon")})});L(this,"handleCurrentLocationRoute",()=>{window.navigator.geolocation.getCurrentPosition(e=>{const{latitude:s,longitude:a}=e.coords;n(this,g).call(this,{lat:s,lon:a})},()=>{window.location.hash=localStorage.getItem("lastLocation")??n(this,_)})});S(this,g,e),this.boot()}boot(){this.registerRoutes(),this.handleRouteChangeOnInit(),this.handleRouteChange()}registerRoutes(){S(this,p,new Map([["/current-location",this.handleCurrentLocationRoute],["/weather",this.handleSearchedLocationRoute]]))}checkRoute(){const e=D(),[s,a]=e.includes("?")?e.split("?"):[e];if(!n(this,p).has(s)){R(document.querySelector('[data-weather="error-popup"]'),{title:"404",message:"Location not found"});return}n(this,p).get(s)(a),!P(s)&&!P(a)&&localStorage.setItem("lastLocation",`${s}?${a}`)}handleRouteChangeOnInit(){window.addEventListener("load",()=>{if(!window.location.hash){window.location.hash=localStorage.getItem("lastLocation")??n(this,_);return}this.checkRoute()})}handleRouteChange(){window.addEventListener("hashchange",()=>{this.checkRoute()})}}_=new WeakMap,p=new WeakMap,g=new WeakMap;const i={Router:null,MeteoStation:null,breakpoints:{xs:0,sm:320,md:768,lg:1200,xl:1600},$:{body:document.body,app:document.querySelector('[data-weather="app"]'),content:document.querySelector('[data-weather="content"]'),searchLoader:document.querySelector('[data-weather="search-loader"]'),errorPopup:document.querySelector('[data-weather="error-popup"]'),search:document.querySelector('[data-weather="search"]'),searchInput:document.querySelector('[data-weather="search-input"]'),searchResults:document.querySelector('[data-weather="search-results"]')},buildSearchResultsItems(t){return t.map(({name:s,state:a,country:r,lat:o,lon:c})=>`
            <li class="search__results-item">
              <a href="#/weather?lat=${o}&lon=${c}" class="search__results-item-container" data-weather="search-results-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="search__results-item-icon" viewBox="0 0 16 20">
                  <path
                    d="M8 9.925c.533 0 .992-.188 1.375-.563.383-.375.575-.829.575-1.362 0-.533-.192-.992-.575-1.375A1.876 1.876 0 0 0 8 6.05c-.533 0-.987.192-1.362.575A1.896 1.896 0 0 0 6.075 8c0 .533.188.987.563 1.362.375.375.829.563 1.362.563Zm0 7.5c2.05-1.883 3.575-3.592 4.575-5.125s1.5-2.9 1.5-4.1c0-1.85-.588-3.358-1.763-4.525C11.137 2.508 9.7 1.925 8 1.925c-1.7 0-3.133.583-4.3 1.75C2.533 4.842 1.95 6.35 1.95 8.2c0 1.2.496 2.567 1.488 4.1.991 1.533 2.512 3.242 4.562 5.125Zm0 2.125a1.13 1.13 0 0 1-.362-.062A1.04 1.04 0 0 1 7.3 19.3c-2.433-2.15-4.246-4.142-5.437-5.975C.671 11.492.075 9.783.075 8.2c0-2.483.796-4.463 2.388-5.938C4.054.787 5.9.05 8 .05s3.95.737 5.55 2.212c1.6 1.475 2.4 3.455 2.4 5.938 0 1.583-.6 3.292-1.8 5.125-1.2 1.833-3.017 3.825-5.45 5.975a.79.79 0 0 1-.312.188A1.232 1.232 0 0 1 8 19.55Z"
                  />
                </svg>
                <span class="search__results-item-data">
                  <h3 class="search__results-item-title">${s}</h3>
                  <p class="search__results-item-description">${a??s}, ${r}</p>
                </span>
              </a>
            </li>
          `).join("")},buildSearchResultsComponent(t){setTimeout(()=>{i.toggleSearchLoadingState()},500);let e=`
      <li class="search__results-item">
        <div class="search__results-item-container" data-weather="search-results-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="search__results-item-icon" viewBox="0 0 16 20">
            <path
              d="M8 9.925c.533 0 .992-.188 1.375-.563.383-.375.575-.829.575-1.362 0-.533-.192-.992-.575-1.375A1.876 1.876 0 0 0 8 6.05c-.533 0-.987.192-1.362.575A1.896 1.896 0 0 0 6.075 8c0 .533.188.987.563 1.362.375.375.829.563 1.362.563Zm0 7.5c2.05-1.883 3.575-3.592 4.575-5.125s1.5-2.9 1.5-4.1c0-1.85-.588-3.358-1.763-4.525C11.137 2.508 9.7 1.925 8 1.925c-1.7 0-3.133.583-4.3 1.75C2.533 4.842 1.95 6.35 1.95 8.2c0 1.2.496 2.567 1.488 4.1.991 1.533 2.512 3.242 4.562 5.125Zm0 2.125a1.13 1.13 0 0 1-.362-.062A1.04 1.04 0 0 1 7.3 19.3c-2.433-2.15-4.246-4.142-5.437-5.975C.671 11.492.075 9.783.075 8.2c0-2.483.796-4.463 2.388-5.938C4.054.787 5.9.05 8 .05s3.95.737 5.55 2.212c1.6 1.475 2.4 3.455 2.4 5.938 0 1.583-.6 3.292-1.8 5.125-1.2 1.833-3.017 3.825-5.45 5.975a.79.79 0 0 1-.312.188A1.232 1.232 0 0 1 8 19.55Z"
            />
          </svg>
          <span class="search__results-item-data">
            <h3 class="search__results-item-title">No locations were found</h3>
            <p class="search__results-item-description">Try again with different location</p>
          </span>
        </div>
      </li>
    `;return t.length&&(e=i.buildSearchResultsItems(t)),i.$.search.classList.add("search--open"),i.$.search.classList.add("search--has-results"),`
      <ul class="search__results-list" data-weather="search-results-list">
        ${e}
      </ul>
    `},renderSearchResultsComponent(t){const e=i.buildSearchResultsComponent(t);m(i.$.searchResults,e)},buildCurrentWeatherComponent(t){const{weather:[{description:e,icon:s}],dt:a,sys:{country:r},main:{temp:o},name:c}=t;return`
      <!-- Current weather section -->
      <section class="section current-weather-card" data-weather="current-weather-section">
        <h3 class="title section__title current-weather-card__title">Now</h3>
        <p class="current-weather-card__details">
          <span class="current-weather-card__temperature">
            ${parseInt(o,10)}
            <span class="current-weather-card__temperature-unit">
              ${w("celsiusDegree")}
            </span>
          </span>
          <img loading="lazy" src="./icons/weather/${s}-desktop.webp" title="${e}" alt="${e}" class="current-weather-card__icon" />
        </p>
        <p class="current-weather-card__conditions">${e}</p>
        <hr class="separator current-weather-card__separator" />
        <p class="current-weather-card__date">
          ${h(a,{weekday:"long",day:"numeric",month:"short"})}
        </p>
        <p class="current-weather-card__location">${c}, ${r}</p>
      </section>
    `},buildForecastComponent(t){return`
      <!-- Five days forecast section -->
      <section class="section forecast-section">
        <h3 class="title section__title forecast-section__title">
          5 days forecast
        </h3>
        <section class="forecast-section__card forecast-card" data-weather="forecast-section">
          ${t.filter((s,a)=>(a+1)%8===0).map(({weather:[{icon:s,description:a}],dt:r,main:{temp_max:o}})=>`
              <div class="forecast-card__day-forecast">
                <p class="forecast-card__temperatures">
                  <img loading="lazy" src="./icons/weather/${s}-mobile.webp" srcset="./icons/weather/${s}-mobile.webp 32w, ./icons/weather/${s}-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" title="${a}" alt="${a}" class="forecast-card__icon" />
                  <span class="forecast-card__day-temperature">
                    ${parseInt(o,10)}${w("degree")}
                  </span>
                </p>
                <p class="forecast-card__date">
                  <span class="forecast-card__calendar-date">
                    ${h(r,{day:"numeric",month:"short"})}
                  </span>
                  <span class="forecast-card__day">
                    ${h(r,{weekday:"long"})}
                  </span>
                </p>
              </div>
            `).join("")}
        </section>
      </section>
      `},buildAirQualityComponent(t){const[{components:{pm2_5:e,so2:s,no2:a,o3:r},main:{aqi:o}}]=t,{quality:c,description:u}=T.getAirQualityData(o);return`
      <section class="highlight-card highlight-card--large highlight__air-quality">
        <h4 class="highlight-card__title">
          air quality index
          <span class="status-indicator status-indicator--${c.replace(/\s+/g,"-").toLowerCase()}" title="${u}">${c}
          </span>
        </h4>
        <div class="highlight-card__data-set">
          <img loading="lazy" src="./icons/air-mobile.webp" srcset="./icons/air-mobile.webp 32w, ./icons/air-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Wind icon - Represents current air quality" class="class highlight-card__icon" />
          <div class="highlight-card__data highlight-card__data--multiple-values">
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${e.toPrecision(3)}
              <span class="highlight-card__unit">PM<span class="highlight-card__unit--sub">2.5</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${s.toPrecision(3)}
               <span class="highlight-card__unit">SO<span class="highlight-card__unit--sub">2</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${a.toPrecision(3)}
               <span class="highlight-card__unit">NO<span class="highlight-card__unit--sub">2</span></span>
            </p>
            <p class="highlight-card__value highlight-card__value--column-above-mobile">
              ${r.toPrecision(3)}
              <span class="highlight-card__unit">O<span class="highlight-card__unit--sub">3</span></span>
            </p>
          </div>
        </div>
      </section>
    `},buildSolarDataComponent(t,e){return`
      <section class="highlight-card highlight-card--large highlight__sunrise-and-sunset">
        <h4 class="highlight-card__title">sunrise & sunset</h4>
        <div class="highlight-card__data-set">
          <div class="highlight-card__data highlight-card__data--column highlight-card__data--row-above-mobile">
            <img loading="lazy" src="./icons/day-mobile.webp" srcset="./icons/day-mobile.webp 32w, ./icons/day-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Sun icon - Represents sunrise" class="class highlight-card__icon" />
            <p class="highlight-card__label">
              Sunrise
                <time class="highlight-card__value" datetime="${h(t,{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"})}">
                  ${h(t,{hour:"numeric",minute:"numeric",hour12:!0})}
              </time>
            </p>
          </div>
          <div class="highlight-card__data highlight-card__data--column highlight-card__data--row-above-mobile highlight-card__data--align-right">
            <img loading="lazy" src="./icons/night-mobile.webp" srcset="./icons/night-mobile.webp 32w, ./icons/night-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Moon icon - Represents sunset" class="class highlight-card__icon" />
            <p class="highlight-card__label highlight-card__label--align-right">
              Sunset
              <time class="highlight-card__value" datetime="${h(e,{year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric"})}">
                ${h(e,{hour:"numeric",minute:"numeric",hour12:!0})}
              </time>
            </p>
          </div>
        </div>
      </section>
    `},buildHumidityComponent(t){return`
      <section class="highlight-card highlight-card--small highlight__humidity">
        <h4 class="highlight-card__title">humidity</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/humidity-mobile.webp" srcset="./icons/humidity-mobile.webp 32w, ./icons/humidity-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Raindrop icon with percent sign inside it - Represents current humidity." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">${t}%</p>
        </div>
      </section>
    `},buildPressureComponent(t){return`
      <section class="highlight-card highlight-card--small highlight__pressure">
        <h4 class="highlight-card__title">pressure</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/pressure-mobile.webp" srcset="./icons/pressure-mobile.webp 32w, ./icons/pressure-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Air wave icon - Represents current pressure." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${t} hPa
          </p>
        </div>
      </section>
    `},buildVisibilityComponent(t){return`
      <section class="highlight-card highlight-card--small highlight__visibility">
        <h4 class="highlight-card__title">visibility</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/visibility-mobile.webp" srcset="./icons/visibility-mobile.webp 32w, ./icons/visibility-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Eye icon - Represents current visibility." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${t/1e3} km
          </p>
        </div>
      </section>
    `},buildFeelsLikeComponent(t){return`
      <section class="highlight-card highlight-card--small highlight__feels-like">
        <h4 class="highlight-card__title">feels like</h4>
        <div class="highlight-card__data">
          <img loading="lazy" src="./icons/feels-like-mobile.webp" srcset="./icons/feels-like-mobile.webp 32w, ./icons/feels-like-desktop.webp 48w" sizes="(min-width: 1200px) 48px, 32px" alt="Thermometer - Represents what current temperature feels like." class="class highlight-card__data-icon" />
          <p class="highlight-card__value">
            ${parseInt(t,10)}${w("celsiusDegree")}
          </p>
        </div>
      </section>
    `},buildHighlightsComponent(t,e){const{main:{feels_like:s,humidity:a,pressure:r},sys:{sunrise:o,sunset:c},visibility:u}=t,k=i.buildAirQualityComponent(e),x=i.buildSolarDataComponent(o,c),A=i.buildHumidityComponent(a),H=i.buildPressureComponent(r),W=i.buildVisibilityComponent(u),q=i.buildFeelsLikeComponent(s);return`
      <!-- Todays weather highlights section -->
      <section class="section highlights-section highlights section--highlights" data-weather="highlights-section">
          <h3 class="title section__title">todays highlights</h3>
          <!-- Air Quality section. -->
          ${k}
          <!-- Sunrise and Sunset section. -->
          ${x}
          <!-- Humidity section. -->
          ${A}
          <!-- Pressure section. -->
          ${H}
          <!-- Visibility section. -->
          ${W}
          <!-- Feels like section. -->
          ${q}
      </section>
    `},buildFollowingHoursTemperatureCards(t){return t.map(({dt:s,weather:[{description:a,icon:r}],main:{temp:o}})=>`
            <li class="today-at-card">
              <time class="today-at-card__label">
                ${h(s,{hour:"2-digit",hour12:!0})}
              </time>
              <img
                loading="lazy"
                src="./icons/weather/${r}-mobile.webp"
                srcset="
                  ./icons/weather/${r}-mobile.webp 32w,
                  ./icons/weather/${r}-desktop.webp 48w
                "
                sizes="(min-width: 1200px) 48px, 32px"
                title="${a}"
                alt="${a}"
                class="today-at-card__icon"
              />
              <p class="today-at-card__label">${parseInt(o,10)}${w("celsiusDegree")}</p>
            </li>
          `).join("")},buildFollowingHoursWindCards(t){return t.map(({dt:s,wind:{deg:a,speed:r}})=>`
            <li class="today-at-card">
              <time class="today-at-card__label">
                ${h(s,{hour:"2-digit",hour12:!0})}
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
                style="transform: rotate(${a}deg);"
              />
              <p class="today-at-card__label">${r} km/h</p>
            </li>
          `).join("")},buildFollowingHoursComponent(t){const e=t.filter((o,c)=>c<8),s=i.buildFollowingHoursTemperatureCards(e),a=i.buildFollowingHoursWindCards(e);return`
      <!-- Following hours section. -->
      <section class="section following-hours-section" data-weather="following-hours-section">
        <h3 class="title section__title">in the following hours</h3>
        <div class="scrollable-container scrollable-container--horizontal">
          <ul class="grid grid--columns-8" data-weather="following-hours-temperature">
          ${s}
          </ul>
          <ul class="grid grid--columns-8" data-weather="following-hours-wind">
          ${a}
          </ul>
        </div>
      </section>
    `},renderContent(t,e,s){i.$.content.classList.contains("content--loading")||i.toggleContentLoadingState();const a=i.buildCurrentWeatherComponent(t),r=i.buildForecastComponent(e),o=i.buildHighlightsComponent(t,s),c=i.buildFollowingHoursComponent(e),u=`
      <!-- Left side of the content. -->
      <div class="content__left">
        ${a}
        ${r}
      </div>
      <!-- Right side of the content. -->
      <div class="content__right">
        ${o}
        ${c}
      </div>`;m(i.$.content,u),setTimeout(()=>{i.toggleContentLoadingState()},250)},async updateWeather(t){try{if(typeof t!="object"||t===null)throw new Error("Invalid argument: args must be an object");if(!("lat"in t&&"lon"in t))throw new Error("Invalid argument: args must contain lat and lon properties of type number");const[e,{list:s},{list:a}]=await Promise.all([i.MeteoStation.getCurrentWeather(t),i.MeteoStation.getForecast(t),i.MeteoStation.getAirQuality(t)]);i.renderContent(e,s,a)}catch(e){R(i.$.errorPopup,{title:e.name,message:e.message})}},toggleContentLoadingState(){i.$.content.classList.toggle("content--loading")},preventPopupClosing(){i.$.errorPopup.addEventListener("cancel",t=>{t.preventDefault()})},clearSearch(){i.$.search.classList.remove("search--open"),i.$.search.classList.remove("search--has-results"),i.$.body.classList.remove("body--no-scroll"),i.$.searchInput.value="",m(i.$.searchResults,"")},toggleSearchLoadingState(){i.$.searchLoader.classList.toggle("loader--hidden")},handleSearchEvents(){i.$.searchInput.addEventListener("input",z(async t=>{if(t.target.value.length){i.toggleSearchLoadingState();const e=await i.MeteoStation.getGeoLocationByQueryString({q:t.target.value,limit:5});i.renderSearchResultsComponent(e)}},500)),I(i.$.app,'[data-weather="search-toggle"]',"click",()=>{i.$.search.classList.toggle("search--open"),i.$.body.classList.toggle("body--no-scroll"),i.$.searchInput.value="",m(i.$.searchResults,"")}),I(i.$.search,'[data-weather="search-results-item"]',"click",i.clearSearch),i.$.body.addEventListener("keyup",t=>{const e=i.$.search.classList.contains("search--open")&&i.$.search.classList.contains("search--has-results");e&&t.key==="Escape"&&i.clearSearch(),e&&t.key==="Tab"&&window.innerWidth>=i.breakpoints.lg&&!i.$.search.contains(t.target)&&i.clearSearch()}),i.$.body.addEventListener("click",t=>{window.innerWidth>=i.breakpoints.lg&&!i.$.search.contains(t.target)&&i.clearSearch()})},bindEvents(){i.handleSearchEvents(),i.preventPopupClosing()},setRouter(){i.Router=new F(i.updateWeather)},setMeteoStation(){i.MeteoStation=new T},setInstances(){i.setRouter(),i.setMeteoStation()},init(){i.setInstances(),i.bindEvents()}};i.init();
