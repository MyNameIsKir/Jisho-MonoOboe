// Wouldn't it be great if ES6 modules worked with this?

// ################################
// MAIN
// ################################

const COUNTER_KEY = 'monooboe-counters';
const RECENT_KEY = 'monooboe-recent';

let port = chrome.runtime.connect();
chrome.storage.sync.get([COUNTER_KEY, RECENT_KEY], function(data) {
  let recent = data[RECENT_KEY] || [];
  let historyCounters = data[COUNTER_KEY] || {};

  recent = track(recent, historyCounters);
  recentHistory(recent);
  monoOboe();
});


// ################################
// MONO OBOE TRACKING
// ################################

function track(recent, historyCounters) {
  let path = decodeURIComponent(window.location.pathname);

  if (path.includes('/search/')) {
    let query = path.replace(/\/search\/|%20%23sentences|%20%23kanji|%20%23names| ?#.*/gi, '');

    if (historyCounters.hasOwnProperty(query)) {
      historyCounters[query] = historyCounters[query] + 1;
    } else {
      historyCounters[query] = 1;
    }

    if (recent.indexOf(query) !== -1) {
      recent.splice(recent.indexOf(query), 1)
    } else if (recent.length === 10) {
      recent.pop();
    }
    recent.unshift(query);

    chrome.storage.sync.set({[COUNTER_KEY]: historyCounters, [RECENT_KEY]: recent}, () => {});

  }

  return recent;
};

// ################################
// MONO OBOE INTERFACE
// ################################

const NAVIGATION_ANCHOR = '.nav-main_navigation ul.links';
const NAV_LINK = `
<a href="${chrome.runtime.getURL('/pages/index.html')}" target="_blank">
  <span>MonoOboe</span>
</a>
`;

function monoOboe() {
  let navAnchor = document.querySelector(NAVIGATION_ANCHOR);

  let navLink = document.createElement('li');
  navLink.innerHTML = NAV_LINK;

  navAnchor.prepend(navLink);
};

// ################################
// RECENT HISTORY INTERFACE
// ################################

const SEARCH_ANCHOR_ID = 'search_sub';
const SEARCH_CLASS = 'search_main';
const CONTAINER_CLASS = 'mono-oboe';
const HISTORY_ACTIVE_CLASS = 'history_area_active';
const SEARCH_ACTIVE_CLASS = 'search_area_active';
const HISTORY_BUTTON_ID = 'history_button';

const historyIcon = `
<!-- -->
<svg viewBox="0 0 448 448" class="icon radical-icon" x="0px" y="0px">
  <g>
      <polygon points="234.667,138.667 234.667,245.333 325.973,299.52 341.333,273.6 266.667,229.333 266.667,138.667       "/>
      <path d="M255.893,32C149.76,32,64,117.973,64,224H0l83.093,83.093l1.493,3.093L170.667,224h-64
        c0-82.453,66.88-149.333,149.333-149.333S405.333,141.547,405.333,224S338.453,373.333,256,373.333
        c-41.28,0-78.507-16.853-105.493-43.84L120.32,359.68C154.987,394.453,202.88,416,255.893,416C362.027,416,448,330.027,448,224
        S362.027,32,255.893,32z"/>
  </g>
  <h4>History</h4>
</svg>
`;

function recentHistory(recent) {
  let anchor = document.getElementById(SEARCH_ANCHOR_ID);
  let linkAnchor = document.getElementById('input_methods');

  let container = document.createElement('div');
  container.classList.add(CONTAINER_CLASS, 'area');
  container.style.display = 'none';
  container.innerHTML = generateHistory(recent);

  let history = document.createElement('div')
  history.classList.add('input_method_button', 'disable-mobile-hover-background');
  history.id = HISTORY_BUTTON_ID;
  history.innerHTML = historyIcon;

  anchor.append(container);
  linkAnchor.append(history);

  history.onclick = toggleHistory;
};

function clearBuiltInActiveSearches() {
  let classes = document.body.classList;

  if (classes.contains('speech_area_active')) {
    document.getElementById('speech_button').click();
  } else if (classes.contains('radical_area_active')) {
    document.getElementById('radical_button').click();
  } else if (classes.contains('handwriting_area_active')) {
    document.getElementById('handwriting_button').click();
  } else if (classes.contains('advanced_area_active')) {
    document.getElementById('advanced_button').click();
  }
};

function generateHistory(historyData) {
  let result = `
    <div id="historyDescription">These are your 10 most recent searches:</div>
  `;
  historyData.forEach(word => result += `<a href="/search/${word}"><div class="recentSearchTerm">${word}</div></a>`);
  return result;
};

function closeHistory(e) {
  if (e.target.closest('#handwriting_button, #radical_button, #speech_button, #advanced_button')) {
    document.removeEventListener('click', closeHistory);
    toggleHistory.bind(document.getElementById(HISTORY_BUTTON_ID))({
      searchButtonClicked: true
    });
  }
};

function toggleHistory({e, searchButtonClicked}) {
  if (!document.body.classList.contains(HISTORY_ACTIVE_CLASS)) {
    if (!searchButtonClicked) {
      clearBuiltInActiveSearches();
    }

    document.getElementById(SEARCH_ANCHOR_ID).style.height = '150px';
    document.getElementById(SEARCH_CLASS).classList.add('in');

    document.body.classList.add(SEARCH_ACTIVE_CLASS, HISTORY_ACTIVE_CLASS);
    document.getElementsByClassName(CONTAINER_CLASS)[0].style.display = 'block';

    this.classList.add(HISTORY_ACTIVE_CLASS);

    document.addEventListener('click', closeHistory);
  } else {
    if (!searchButtonClicked) {
      document.getElementById(SEARCH_ANCHOR_ID).style.height = '0px';
      document.getElementById(SEARCH_CLASS).classList.remove('in');
    }

    document.body.classList.remove(SEARCH_ACTIVE_CLASS, HISTORY_ACTIVE_CLASS);
    document.getElementsByClassName(CONTAINER_CLASS)[0].style.display = 'none';

    this.classList.remove(HISTORY_ACTIVE_CLASS);
  }
};

// This was an attempt to fix a bug where resizing the window closes the history search.
// Because a height of 0px is being saved in the search bar object, and this code doesn't
// have access to that, best to just leave the bug as is.
// window.addEventListener('resize', function() {
//   if (document.body.classList.contains('history_area_active')) {
//     document.getElementById(SEARCH_ANCHOR_ID).style.height = '150px';
//   }
// });