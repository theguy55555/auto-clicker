'use strict';


class AutoClicker {
  constructor() {
    this.intervalList = [];
    this.lastMouseMoveEvent = null;
    this.indicator = document.createElement('div');
    this.indicator.id = 'AutoClickerIndicator';

    const keyupEventListener = this.windowKeyupListener.bind(this);
    const windowMousemoveListener = this.windowMousemoveListener.bind(this);
    window.addEventListener('keyup', keyupEventListener);
    window.addEventListener('mousemove', windowMousemoveListener);

    console.log('AutoClicker initialize complete');
  }

  windowMousemoveListener(event) {
    this.lastMouseMoveEvent = event;
  }

  eventPositionClicker(event) {
    return function () {
      const newEvent = new MouseEvent('click', { bubbles: true });
      event.target.dispatchEvent(newEvent);
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

  runAutoClick(isPrompt) {
    if (this.intervalList.length === 0) {
      let timeout = 0;
      if (isPrompt) {
        timeout = window.prompt('Insert click interval(ms).', '0');
        if (timeout === null) {  // CASE: 취소
          return false;
        }
        timeout = Number(timeout);
        if (isNaN(timeout)) {
          alert('Please enter a number.');
          this.runAutoClick();
          return false;
        }
        if (timeout < 0) {
          alert('Please enter at least 0.');
          this.runAutoClick();
          return false;
        }
      }
      const event = this.lastMouseMoveEvent;
      this.showIndicator(event);
      const intervalNumber = window.setInterval(this.eventPositionClicker(event), timeout);
      this.intervalList.push(intervalNumber);
      const id = event.target.id ? `#${event.target.id}` : '';
      const className = event.target.className ? `.${event.target.className}` : '';
      console.log(`Start auto click to ${event.target.tagName}${id}${className}`);
    }
  }

  stopAutoClick() {
    if (this.intervalList.length > 0) {
      this.removeIndicator();
      this.intervalList.map(intervalNumber => window.clearInterval(intervalNumber));
      this.intervalList = [];
      console.log(`Stop auto click.`);
    }
  }

  windowKeyupListener(event) {
    if (event.shiftKey) {
      if (event.code === 'Digit1') {
        this.runAutoClick(event.altKey);
      } else if (event.code === 'Digit2') {
        this.stopAutoClick();
      }
    }
  }
}
