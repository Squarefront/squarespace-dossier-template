(function(){
  'use strict';

  /**
   * All template-level Javascript is namespaced
   * onto the Template namespace.
   *
   * @namespace
   */
  window.Template = window.Template || {};

  /**
   * Template.Constants holds all constants, such
   * as breakpoints, timeouts, etc.
   *
   * @memberof Template
   * @inner
   */
  window.Template.Constants = {
    AUTHENTICATED: document.documentElement.hasAttribute('data-authenticated-account'),
    DEBUG: true,
    MOBILE_BREAKPOINT: 640
  };

  /**
   * Template.Data holds all cached values shared
   * between controllers.
   *
   * @memberof Template
   * @inner
   */
  window.Template.Data = {};

  /**
   * Template.Util has some useful utility methods,
   * like a resize end handler.
   *
   * @memberof Template
   * @inner
   */
  window.Template.Util = {

    scroll: function (fn, thisArg) {

      thisArg = thisArg || window;

      fn = fn.bind(thisArg);

      window.addEventListener('scroll', fn);

      window.addEventListener('mercury:unload', function () {

        window.removeEventListener('scroll', fn);

      });

    },

    resizeEnd: function (fn, thisArg) {

      thisArg = thisArg || window;

      var RESIZE_TIMEOUT = 100;
      var isDragging = false;
      var _resizeMeasureTimer;

      var resize = function () {

        isDragging = true;

        clearTimeout(_resizeMeasureTimer);

        _resizeMeasureTimer = setTimeout(function () {
          fn.apply(thisArg);

          isDragging = false;
        }, RESIZE_TIMEOUT);

      };

      window.addEventListener('resize', resize);

      window.addEventListener('mercury:unload', function () {
        window.removeEventListener('resize', resize);
      });

    }

  };

  /**
   * Template.Controllers holds the controller
   * functions, where all the actual Javascript
   * that does stuff is contained.
   *
   * @memberof Template
   * @inner
   */
  window.Template.Controllers = {};

})();