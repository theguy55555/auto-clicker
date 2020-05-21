'use strict';


class AutoClicker {
  constructor() {
    this.intervalList = [];
    this.lastMouseMoveEvent = null;
    this.indicator = document.createElement('div');
    this.indicator.id = 'AutoClickerIndicator';

    const keyupEventListener = this.windowKeyupListener.bind(this);
    const windowMousemoveListener = this.windowMousemoveListener.bind(this);
    const getUserOptions = this.getUserOptions.bind(this);
    const storageOnChangedListener = this.storageOnChangedListener.bind(this);
    window.addEventListener('keydown', keyupEventListener);
    window.addEventListener('mousemove', windowMousemoveListener);
    chrome.storage.sync.get('USER_OPTIONS', getUserOptions);
    chrome.storage.onChanged.addListener(storageOnChangedListener);

    console.log('AutoClicker initialize complete');
  }

  _comparable(o) {
    return (typeof o != 'object' || !o)
      ? o
      : Object.keys(o).sort().reduce((c, key) => (c[key] = this._comparable(o[key]), c), {});
  }

  /**
   * 크롬 스토리지 fetch!
   * @param items
   */
  getUserOptions(items) {
    const empty = Object.keys(items).length === 0;
    if (empty) {
      chrome.storage.sync.set({ USER_OPTIONS });
      this.USER_OPTIONS = USER_OPTIONS;
    } else {
      this.USER_OPTIONS = items.USER_OPTIONS;
    }
    this.USER_OPTIONS = USER_OPTIONS;
  }

  /**
   * 크롬 스토리지 변경할때 동작하는 함수
   * @param changes
   */
  storageOnChangedListener(changes) {
    if (changes.USER_OPTIONS.newValue && Object.keys(changes.USER_OPTIONS.newValue.length > 0)) {
      Object.keys(changes.USER_OPTIONS.newValue).map(key => {
        this.USER_OPTIONS[key] = changes.USER_OPTIONS.newValue[key];
      });
    }
  }

  windowMousemoveListener(event) {
    this.lastMouseMoveEvent = event;
  }

  eventPositionClicker(event, clickEvent) {
    return function () {
      const mouseEvent = new MouseEvent(clickEvent, {
        bubbles: true,
      });
      event.target.dispatchEvent(mouseEvent);
    };
  }

  showIndicator(event) {
    let domIndicator = document.getElementById('AutoClickerIndicator');
    if (domIndicator === null) {
      domIndicator = document.body.appendChild(this.indicator);
    }
    domIndicator.style.top = `${event.pageY - 10}px`;
    domIndicator.style.left = `${event.pageX - 10}px`;
  }

  removeIndicator() {
    let domIndicator = document.getElementById('AutoClickerIndicator');
    if (domIndicator) {
      domIndicator.remove();
    }
  }

  _runClicking(timeout) {
    const event = this.lastMouseMoveEvent;
    this.showIndicator(event);
    const intervalNumber = window.setInterval(this.eventPositionClicker(event, this.USER_OPTIONS.event), timeout);
    this.intervalList.push(intervalNumber);
    const id = event.target.id ? `#${event.target.id}` : '';
    const className = event.target.className ? `.${event.target.className}` : '';
    console.log(`${timeout}: Start auto click to ${event.target.tagName}${id}${className}`);
  }

  start() {
    if (this.intervalList.length === 0) {
      this._runClicking(0);
    }
  }

  startWithInterval() {
    if (this.intervalList.length === 0) {
      let timeout = 0;
      timeout = window.prompt('Insert click interval(millisecond).', '0');
      if (timeout === null) {  // CASE: 취소
        return false;
      }
      timeout = Number(timeout);
      if (isNaN(timeout)) {
        alert('Please enter a number.');
        this.startWithInterval();
        return false;
      }
      if (timeout < 0) {
        alert('Please enter at least 0.');
        this.startWithInterval();
        return false;
      }
      this._runClicking(timeout);
    }
  }

  stop() {
    if (this.intervalList.length > 0) {
      this.removeIndicator();
      this.intervalList.map(intervalNumber => window.clearInterval(intervalNumber));
      this.intervalList = [];
      console.log(`Stop auto click.`);
    }
  }

  windowKeyupListener(event) {
    const { shiftKey, ctrlKey, altKey, metaKey, code } = event;
    const currentKeyEvent = { shiftKey, ctrlKey, altKey, metaKey, code };
    const keymap = this.USER_OPTIONS.keymap;
    for (const key in keymap) {
      if (keymap.hasOwnProperty(key)) {
        if (JSON.stringify(this._comparable(keymap[key])) === JSON.stringify(this._comparable(currentKeyEvent))) {
          this[key]();
        }
      }
    }
  }
}
