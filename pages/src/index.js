const COUNTER_KEY = 'monooboe-counters';
const TABLE_BODY_ID = 'history-table-body';
const SEARCH_INPUT_ID = 'history-search';
const DELETE_CLASS = 'delete-button';

function sortWords(words, counters) {
  return words.sort((a, b) => counters[b] - counters[a]);
};

function searchWords(words, query) {
  return words.filter(word => word.includes(query));
};

let port = chrome.runtime.connect();
chrome.storage.sync.get([COUNTER_KEY], function(data) {
  let tableBody = document.getElementById(TABLE_BODY_ID);
  let searchInput = document.getElementById(SEARCH_INPUT_ID);

  let counters = data[COUNTER_KEY];
  let allWords = sortWords(Object.keys(counters), counters);
  let currentWords = allWords;
  let query = "";

  generateTable();

  searchInput.addEventListener('input', e => {
    query = e.target.value;
    runSearch();
  });

  function runSearch() {
    currentWords = searchWords(allWords, query);
    generateTable();
  };

  function deleteWord(event) {
    let word = event.target.dataset.key;

    delete counters[word];
    allWords = sortWords(Object.keys(counters), counters);

    chrome.storage.sync.set({[COUNTER_KEY]: counters}, () => {});

    runSearch();
  };

  function generateTable() {
    let result = '';
    document.querySelectorAll(`.${DELETE_CLASS}`).forEach((node) => {
      node.removeEventListener('click', deleteWord);
    });

    currentWords.forEach(word => {
      result += `
        <tr>
          <td>
            <a href="https://jisho.org/search/${word}">
              ${word}
            </a>
          </td>
          <td>${counters[word]}</td>
          <td>
            <a href="#" class="${DELETE_CLASS}"
              data-key="${word}">x</a>
          </td>
        </tr>`;
    });

    tableBody.innerHTML = result;

    document.querySelectorAll(`.${DELETE_CLASS}`).forEach((node) => {
      node.addEventListener('click', deleteWord);
    });
  };

});