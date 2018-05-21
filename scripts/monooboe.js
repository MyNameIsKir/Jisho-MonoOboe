const counterKey = 'monooboe-counters';
const recentKey = 'monooboe-recent'
const componentDefault = `
<div id="monooboe" class="area" style="display: block;">
  Hello World
</div>
`;
const historyIcon = `
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

let port = chrome.runtime.connect();
chrome.storage.sync.get([counterKey, recentKey], function(data) {
  let path = decodeURIComponent(window.location.pathname);
  let historyCounters = data[counterKey] || {};
  let recent = data[recentKey] || [];
  window.historyCounters = historyCounters; // Make sure to keep this out of final

  let anchor = document.getElementById('search_sub');
  let linkAnchor = document.getElementById('input_methods');

  let container = document.createElement('div');
  container.classList.add('mono-oboe', 'area');
  container.innerHTML = generateHistory(recent);

  let history = document.createElement('div');
  history.classList.add('input_method_button', 'disable-mobile-hover-background');
  history.innerHTML = historyIcon;

  anchor.append(container);
  linkAnchor.append(history);

  history.onclick = toggleHistory;

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

    chrome.storage.sync.set({[counterKey]: historyCounters, [recentKey]: recent}, function() {
      // container.innerHTML = `You have searched for ${query} a total of ${total} time(s).`;
      console.log("hopefully saved");
    });
  }
});

function generateHistory(historyData) {
  let result = `
    <div>These are your 10 most recent searches:</div>
  `;
  historyData.forEach(word => result += `<div class="recentSearchTerm">${word}</div>`);
  return result;
};

function toggleHistory() {
  if (!document.body.classList.contains('history_area_active')) {
    document.getElementById('search_sub').style.height = '150px';
  } else {
    document.getElementById('search_sub').style.height = '0px';
  }
  document.body.classList.toggle('search_area_active');
  document.body.classList.toggle('history_area_active');
  document.getElementById('search_main').classList.toggle('in');
};