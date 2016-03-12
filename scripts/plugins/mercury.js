


window.Template = window.Template || {};
window.Template.Plugins = window.Template.Plugins || {};


window.Template.Plugins.mercury = (function () {

  'use strict';


  if (!window.history || !window.history.pushState) {
    return false;
  }

  var createInstance = function (config) {

    // Set scrollRestoration to manual
    window.history.scrollRestoration = 'manual';

    // Set config vars
    config = config || {};

    var useHistory = config.useHistory;
    var cacheMode = config.cacheMode;

    var updateMatrix = config.updateMatrix;
    var onClickExceptions = config.onClickExceptions || [];
    var onClickExceptionSelector = onClickExceptions.length > 0 ? onClickExceptions.join(',') : 'a';

    var onRequestExceptions = config.onRequestExceptions || [];
    var onRequestExceptionRegex = new RegExp(onRequestExceptions.join('|'), 'gi');

    var loadEvent = new CustomEvent('mercury:load');
    var unloadEvent = new CustomEvent('mercury:unload');

    if (cacheMode) {
      window.Template.Data = window.Template.Data || {};
      window.Template.Data.mercuryCache = {};
    }


    // --------------------------------------


    var beforeRequest = function () {

      var url = window.location.pathname + window.location.search;

      // Update history state
      if (useHistory) {
        var stateObject = {
          url: url,
          scroll: {
            x: window.pageXOffset,
            y: window.pageYOffset
          }
        };
        history.replaceState(stateObject, document.title, url);
      }

      // Add loading attr
      document.documentElement.setAttribute('data-mercury-loading', '');

      // Dispatch unload event
      window.dispatchEvent(unloadEvent);

      // Destroy squarespace functionality
      if (window.SQS) {
        window.SQS.Lifecycle.destroy();
      }

    };


    // --------------------------------------


    var makeRequest = function (url, callback, newHistoryState) {

      beforeRequest();

      var request = new XMLHttpRequest();

      request.onreadystatechange = function (e) {

        if (e.target.readyState !== XMLHttpRequest.DONE || e.target.status !== 200) {
          return;
        }

        try {

          if (e.target.responseText.match(onRequestExceptionRegex) !== null) {
            window.location = url;
            return;
          }

          if (callback) { callback(url, e.target.responseText); }

          // Add history state
          if (newHistoryState && useHistory) {
            var stateObject = {
              url: url
            };
            history.pushState(stateObject, document.title, url);
          }

        } catch (error) {

          console.error('ERROR:' + error);

        }

      };

      // Handle error state (i.e. internet disconnected)
      request.onerror = function () {

        window.location = url;

      };

      request.open('GET', url, true);
      request.send();

    };


    // --------------------------------------


    var replaceAttributes = function (element, referenceElement) {

      var i;

      // Remove existing attributes from element first
      for (i = 0; i < element.attributes.length; i++) {
        element.removeAttribute(element.attributes[i].name);
      }

      // Set new attributes from reference element
      for (i = 0; i < referenceElement.attributes.length; i++) {
        element.setAttribute(referenceElement.attributes[i].name, referenceElement.attributes[i].value);
      }

    };


    // --------------------------------------


    var commitCacheEntry = function (url, selector) {

      if (!cacheMode || !url || !selector) {
        return false;
      }

      var cache = window.Template.Data.mercuryCache;
      cache[url] = cache[url] || {};
      cache[url][selector] = document.querySelector(selector).innerHTML;

    };


    // --------------------------------------


    var afterRequest = function (url, responseText) {

      // Process updates
      var parser = new DOMParser();
      var newDoc = parser.parseFromString(responseText, 'text/html');

      updateMatrix.forEach(function (updateItem) {

        var activeElement = document.querySelector(updateItem.selector);
        var referenceElement = newDoc.querySelector(updateItem.selector);

        if (activeElement) {

          if (referenceElement) {

            // Update HTML
            if (updateItem.updateHTML) {

              var newHTML = referenceElement.innerHTML;

              // Check cache
              if (cacheMode) {

                var cache = window.Template.Data.mercuryCache;

                if (cache && cache[url] && cache[url][updateItem.selector]) {
                  newHTML = cache[url][updateItem.selector];
                }

              }

              activeElement.innerHTML = newHTML;

            }

            // Update attributes
            if (updateItem.updateAttrs) {

              replaceAttributes(activeElement, referenceElement);

            }

          } else {

            // No reference element, remove active el
            activeElement.parentNode.removeChild(activeElement);

          }

        }

      });

      // init squarespace functionality
      if (window.SQS) {
        window.SQS.Lifecycle.init();
      }

      // Dispatch load event
      window.dispatchEvent(loadEvent);

      // Scroll to top
      window.scrollTo(0, 0);

      // End loading state
      document.documentElement.setAttribute('data-mercury-loading', 'done');
      setTimeout(function () {
        document.documentElement.removeAttribute('data-mercury-loading');
      }, 500);

    };


    // --------------------------------------


    var onClick = function (e) {

      // Stop if click event is key modified
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
        return false;
      }

      // Walk up DOM
      var target = e.target;
      while (target && target !== document.body && target.tagName.toUpperCase() !== 'A') {
        target = target.parentElement;
      }

      // Stop logic if body or exception
      if (!target || target === document.body || target.matches(onClickExceptionSelector)) {
        return false;
      }

      // Prevent default
      e.preventDefault();

      // Get URL
      var url = target.getAttribute('href');

      // Make request
      makeRequest(url, afterRequest, true);

    };


    // --------------------------------------


    var onPopState = function (e) {

      if (!e.state) { return false; }

      var callback = function () {

        afterRequest.apply(null, arguments);

        if (e.state.scroll) {
          window.scrollTo(e.state.scroll.x, e.state.scroll.y);
        } else {
          window.scrollTo(0, 0);
        }

      };

      makeRequest(e.state.url, callback, false);

    };


    // --------------------------------------


    return {

      bind: function () {

        // Bind click functionality
        document.body.addEventListener('click', onClick);


        if (useHistory) {

          // Bind popstate functionality
          window.addEventListener('popstate', onPopState);

        }


      },

      destroy: function () {

        document.body.removeEventListener('click', onClick);

        if (useHistory) {
          window.removeEventListener('popstate', onPopState);
        }

      },

      commitCacheEntry: commitCacheEntry

    };


  };


  // Singleton logic

  var instance;

  return {


    getInstance: function (config) {

      if (!instance) {
        instance = createInstance(config);
      }

      return instance;

    }


  };



})();
