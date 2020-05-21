
// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });
//
// alert(JSON.stringify(USER_OPTIONS, null, 2));
//
// chrome.storage.sync.set(USER_OPTIONS, function() {
//   // Update status to let user know options were saved.
//   var status = document.getElementById('status');
//   status.textContent = 'Options saved.';
//   setTimeout(function() {
//     status.textContent = '';
//   }, 750);
// });
let down = false;
class Popup {
  constructor() {
    this.CURRENT_USER_OPTIONS = {};
    this._fetchUserOptions();
    this._attachDocumentEventListeners();
  }

  _fetchUserOptions() {
    chrome.storage.sync.get('USER_OPTIONS', function(items) {
      console.log('items', items);
      const empty = Object.keys(items).length === 0 && items.constructor === Object;
      if (empty) {
        chrome.storage.sync.set({ USER_OPTIONS });
        this.CURRENT_USER_OPTIONS = USER_OPTIONS;
      } else {
        this.CURRENT_USER_OPTIONS = items.USER_OPTIONS;
      }
      document.querySelector(`#${this.CURRENT_USER_OPTIONS.event}`).click();
      console.log(this.CURRENT_USER_OPTIONS.keymap);
    });
  }

  _attachDocumentEventListeners() {
    document.addEventListener('change', async (event) => {
      if (event.target.matches('.event-inputs')) {
        this.CURRENT_USER_OPTIONS.event = event.target.value;
        chrome.storage.sync.set({ USER_OPTIONS: this.CURRENT_USER_OPTIONS });
      }
    }, false);


    document.addEventListener('keydown', async(event) => {
      if (down) {
        return false;
      }
      down = true;
    }, false);

    document.addEventListener('keyup', async(event) => {
      down = false;
    }, false);



    document.addEventListener('reset', async (event) => {
      if (event.target.matches('#options-form')) {
        event.preventDefault();
        event.stopPropagation();
        chrome.storage.sync.clear(this._fetchUserOptions);
      }
    });
  }
}
new Popup();
