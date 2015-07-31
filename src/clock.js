(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Clock = factory();
  }
}(this, function () {

  var requestAnimationFrame = window.requestAnimationFrame || (function() {
    var raf = null;
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !raf; ++x) {
      raf = window[vendors[x]+'RequestAnimationFrame'];
    }
 
    if (!raf) {
      raf = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    return raf.bind(window);
  }());

  var Clock = function(options) {
    this._raf = this._render.bind(this);
    this._liveButtonClick = this._liveButtonClick.bind(this);
    this._hoursMouseDown = this._hoursMouseDown.bind(this);
    this._minutesMouseDown = this._minutesMouseDown.bind(this);
    
    this.el = document.getElementById(options.el);
    
    if (this.el) {
      var skin = this.skin = document.createElement('object');
      skin.setAttribute("type", "image/svg+xml");
      skin.setAttribute("data", "./src/clock.svg");
      var loadHandler = function() {
        var svg = this.skin.getSVGDocument();
        this.pointerHours = svg.getElementById("pointerHours");
        this.pointerMinutes = svg.getElementById("pointerMinutes");
        this.pointerSeconds = svg.getElementById("pointerSeconds");
        this.liveButton = svg.getElementById("liveButton");
      }.bind(this);
      skin.addEventListener("load", loadHandler);
      this.el.appendChild(skin);
    }

    this.time = Date.now();
    this.mode = "live";
  };

  Clock.prototype = {
    _interval: -1,
    _pointerHours: null,
    _pointerMinutes: null,
    pointerSeconds: null,

    _rerender: function() {
      if (!this._rafTimer) {
        this._rafTimer = requestAnimationFrame(this._raf);
      }
    },

    _render: function() {
      this._rafTimer = null;

      var pointerHours = this.pointerHours;
      var pointerMinutes = this.pointerMinutes;
      var pointerSeconds = this.pointerSeconds;
      if (!pointerHours || !pointerMinutes || !pointerSeconds) {
        this._rerender();
        return;
      }

      var date = new Date();
      date.time = this.time;

      var hours   = date.getHours();
      var minutes = date.getMinutes() + hours * 60;
      var seconds = date.getSeconds() + minutes * 60;
        
      var hoursAngle = (seconds / 120);
      var minutesAngle = seconds * 0.1;
      var secondsAngle = 6 * (seconds % 60);
        
      pointerHours.setAttribute("transform", "rotate(" + hoursAngle + ", 0, 0)");
      pointerMinutes.setAttribute("transform", "rotate(" + minutesAngle + ", 0, 0)");
      pointerSeconds.setAttribute("transform", "rotate(" + secondsAngle + ", 0, 0)");
    },

    _hoursMouseDown: function(evt) {
      var enabled = true;
      var svg = this.skin.getSVGDocument();
      var doc = this.el.ownerDocument;
      var mouseX = 0;
      var mouseY = 0;

      var enterFrame = function() {
        var deltaAngle = this._getDeltaAngle(mouseX, mouseY);
//         if (deltaAngle != 0) {
//             this.mode = "manual";
//             // 30 degrees = 1 hour
//             // 1 hour = 60 minutes
//             // 60 minutes = 3,600,000 millisecs
//             // 30 degrees = 3,600,000 millisecs
//             // 1 degree = 3,600,000 / 30 = 120,000 millisecs
//             var deltaTime = deltaAngle * 120000;
//             value += deltaTime;
//         }
        if (enabled) {
          requestAnimationFrame(enterFrame);
        }
      }.bind(this);
      
      var mouseUp = function() {
        enabled = false;
        svg.removeEventListener("mouseup", mouseUp, true);
        doc.removeEventListener("mouseup", mouseUp, true);
        svg.removeEventListener("mousemove", mouseMove, true);
        doc.removeEventListener("mousemove", mouseMove, true);
      };

      var mouseMove = function(evt) {
        mouseX = evt.pageX;
        mouseY = evt.pageY;
      }

      svg.addEventListener("mouseup", mouseUp, true);
      doc.addEventListener("mouseup", mouseUp, true);
      doc.addEventListener("mousemove", mouseMove, true);
      svg.addEventListener("mousemove", mouseMove, true);


      requestAnimationFrame(enterFrame);

      //systemManager.getSandboxRoot().addEventListener(MouseEvent.MOUSE_UP, pointerMouseUpHandler, false, 0, true);
      //storeManualRotationStartValues(hoursPointer.rotation, event);
    },

    _minutesMouseDown: function(evt) {

    },

    _liveButtonClick: function(evt) {

    },

    _getDeltaAngle(mouseX, mouseY) {
      console.log(mouseX, mouseY);
//       var mousePosition:Point = localToGlobal(new Point(mouseX, mouseY));
//       var newVector:Vector3D = new Vector3D(mousePosition.x, mousePosition.y);
//       newVector = newVector.subtract(m_globalCenter);
//       newVector.normalize();
//       var n:Vector3D = m_originVector.crossProduct(newVector);
//       var deltaAngle:Number = Vector3D.angleBetween(m_originVector, newVector) * DEG_PER_RAD;
//       if (n.z < 0)
//       {
//           deltaAngle = -deltaAngle;
//       }
//       if (isNaN(deltaAngle))
//       {
//           deltaAngle = 0;
//       }
//       m_originVector.setTo(mousePosition.x, mousePosition.y, 0.0);
//       m_originVector = m_originVector.subtract(m_globalCenter);
//       m_originVector.normalize();
//       return deltaAngle;
    }
  };

  Object.defineProperties(Clock.prototype, {

    pointerHours: {
      get: function() {
        return this._pointerHours;
      },
      set: function(value) {
        if (this._pointerHours) {
          this._pointerHours.removeEventListener("mousedown", this._hoursMouseDown);
        }
        this._pointerHours = value;
        if (this._pointerHours) {
          this._pointerHours.addEventListener("mousedown", this._hoursMouseDown);
        }
      }
    },

    pointerMinutes: {
      get: function() {
        return this._pointerMinutes;
      },
      set: function(value) {
        if (this._pointerMinutes) {
          this._pointerMinutes.removeEventListener("mousedown", this._minutesMouseDown);
        }
        this._pointerMinutes = value;
        if (this._pointerMinutes) {
          this._pointerMinutes.addEventListener("mousedown", this._minutesMouseDown);
        }
      }
    },

    liveButton: {
      get: function() {
        return this._liveButton;
      },
      set: function(value) {
        if (this._liveButton) {
          this._liveButton.removeEventListener("click", this._liveButtonClick);
        }
        this._liveButton = value;
        if (this._liveButton) {
          this._liveButton.addEventListener("click", this._liveButtonClick);
        }
      }
    },

    mode: {
      get: function() {
        return this._mode;
      },
      set: function(value) {
        if (this._mode === value) { return; }
        this._mode === value;
        if (value === "manual" && this._interval !== -1) {
          clearInterval(this._interval);
          this._interval = -1;
        }
        else if (value === "live" && this._interval === -1) {
          this._interval = setInterval(function() {
            this.time = Date.now();
          }.bind(this), 50);
        }
      }
    },

    time: {
      get: function() {
        return this._time;
      },
      set: function(value) {
        if (this._time === value) { return; }
        this._time = value;
        this._rerender();
      }
    }
  });

  return Clock;
}));