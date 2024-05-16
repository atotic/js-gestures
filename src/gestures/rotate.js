/**
 * Rotate gesture
 *
 * Tracks two-finger rotational gesture.
 * Rotation angle passed to effect.moved
 * 
 * Currently only works on touch devices.
 * Trackpad does not expose any multitouch events.
 * 
 * TODO: implement desktop variant, trigger on option key, UI a rotate cursor
 * 
 * References:
 * https://kenneth.io/post/detecting-multi-touch-trackpad-gestures-in-javascript
 */

import GestureHandler from "./gestureHandler.js"

export default class RotateGesture extends GestureHandler {
  #myEventSpecs = new Map([
    ['idle', ['touchstart']],
    ['waiting', [
      { eventType: 'touchmove'},
      { eventType: 'touchend'},
      { eventType: 'touchcancel' }
      ]
    ],
    ['active', [
     	{ eventType: 'touchmove'},
      { eventType: 'touchend'},
      { eventType: 'touchcancel'}
      ]
    ]]);
  threshold = 2;

  constructor(element, options) {
  	super(element, options);
  }
  name() {
  	return "Rotate";
  }
	eventSpecs(state) {
	  return this.#myEventSpecs.get(state);
	}

	#aboveThreshold(ev) {
		return this.threshold == 0 || (Math.abs(ev.rotation) > this.threshold);
	}

	handleIdleEvent(ev) {
		// logEvent(ev);
		if (ev.type == 'touchstart') {
			if (ev.touches.length == 2) {
				if (this.#aboveThreshold(ev))
					return "active";
				else
					return "waiting";
			}
		}
	}

	handleWaitEvent(ev) {
		// logEvent(ev);
		if (ev.type == 'touchmove') {
			if (ev.touches.length != 2)
				console.warn("LESS THAN 2 TOUCHES ", ev.touches.length);
						ev.preventDefault();
			this.options.effect.moved(this, ev, this.getState(), ev.rotation);
			if (this.#aboveThreshold(ev))
				return "active";
			return;
		}
		if (ev.type == "touchend" || ev.type == "touchcancel") {
			this.options.effect.cancelled(this, ev);
			return "idle";
		}
		console.warn("Unexpected wait event ", ev.type);
	}

	handleActiveEvent(ev) {
		if (ev.type == "touchmove") {
			if (ev.touches.length != 2)
				console.warn("LESS THAN 2 TOUCHES ", ev.type, ev.touches.length);
			ev.preventDefault();
			this.options.effect.moved(this, ev, this.getState(), ev.rotation);
			return;
		}
		if (ev.type == "touchend") {
			this.options.effect.completed(this,ev, ev.rotation);
			return "idle";
		}
		if (ev.type == "touchcancel") {
			this.options.effect.cancelled(this, ev);
			return "idle";
		}
	}
}
