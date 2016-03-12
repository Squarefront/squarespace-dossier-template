
window.Template = window.Template || {};
window.Template.Plugins = window.Template.Plugins || {};

(function (Plugins) {

  'use strict';

  Plugins.ancillary = function (base) {

    // Get base name constant for selectors
    var BASE_NAME = base.getAttribute('data-nc-base').toLowerCase();

    // Get collapse settings
    var COLLAPSE = base.getAttribute('data-nc-collapsible') !== null;

    // Get min and max
    var minWidthValue = base.getAttribute('data-nc-min');
    var maxWidthValue = base.getAttribute('data-nc-max');
    var MIN_WIDTH = minWidthValue && minWidthValue.length > 0 ? parseFloat(minWidthValue) : null;
    var MAX_WIDTH = maxWidthValue && maxWidthValue.length > 0 ? parseFloat(maxWidthValue) : null;

    // Vars to be initialized later
    var positions;
    var elements;
    var containers;
    var groups;


    // -------------------------------


    /**
     * Given a setting string for this
     * ancillary base, validate and parse
     * the string into an object with an
     * elementName and containerName.
     *
     * @method parse
     * @public
     */

    var parse = function (string) {

      // Convert to lowercase
      string = string.toLowerCase();

      // Check if ancillary
      if (string.indexOf('ancillary-') >= 0) {

        // Remove 'ancillary' from string
        string = string.replace('ancillary-', '');

        // Check if correct base
        if (string.indexOf(BASE_NAME + '-') >= 0) {

          // Remove base name from string
          string = string.replace(BASE_NAME + '-', '');

          // Split string
          var array = string.split(/-position-?/);

          if (array.length === 2) {

            return {
              elementName: array[0],
              containerName: array[1]
            };

          } else {

            console.error('Invalid position string: "' + string + '".');

          }

        }

      }

      return null;

    };


    // -------------------------------


    /**
     * Grab all nc-elements from the DOM, and
     * store in object with element names as
     * keys for accessibility purposes.
     *
     * @method _getElements
     * @private
     */
    var getElements = function () {

      // Element object
      var elementObject = {};

      // Get elements
      var elementNodes = Array.prototype.slice.call(base.querySelectorAll('[data-nc-element]'));

      // Loop through elements and add to object
      elementNodes.forEach(function (elementNode) {

        var elementName = elementNode.getAttribute('data-nc-element');

        if (elementName.length > 0) {
          elementObject[elementName] = elementNode;
        }

      });

      return elementObject;

    };


    // -------------------------------


    /**
     * Grab all nc-containers from the DOM,
     * store in object with container names
     * as keys for accessibility purposes.
     * Elements in the container are also
     * stored as a nodelist.
     *
     * @method _getContainers
     * @private
     */
    var getContainers = function () {

      // Container object
      var containerObject = {};

      // Get container nodes
      var containerNodes = Array.prototype.slice.call(base.querySelectorAll('[data-nc-container]'));

      // Loop through container nodes and add to object
      containerNodes.forEach(function (containerNode) {

        var containerName = containerNode.getAttribute('data-nc-container');

        if (containerName.length > 0) {
          containerObject[containerName] = containerNode;
        }

      });

      return containerObject;

    };


    // -------------------------------

    /**
     * Get all collapse groups from the DOM.
     *
     * @method _getGroups
     * @private
     */
    var getGroups = function () {

      // Clear elements object
      var groupObject = {};

      // Get elements
      var groupNodes = Array.prototype.slice.call(base.querySelectorAll('[data-nc-group]'));

      if (groupNodes.length === 0 && base.hasAttribute('data-nc-group')) {
        // Base is group (no multi-group)
        groupNodes = [base];
      } else {
        return false;
      }

      // Loop through groups
      groupNodes.forEach(function (groupNode) {

        // Get name
        var groupName = groupNode.getAttribute('data-nc-group');

        // Add object
        if (groupName.length > 0) {
          groupObject[groupName] = {
            node: groupNode,
            containers: groupNode.querySelectorAll('[data-nc-container]'),
            breakpoint: {
              min: 0,
              max: 999999
            }
          };
        }
      });


      return groupObject;

    };


    // -------------------------------


    /**
     * Match strings in className of body
     * that may be valid positions, parse,
     * and insert into object.
     *
     * @method _getPositions
     * @private
     */

    var getPositions = function () {

      var positionObject = {};

      // Get body classes and parse
      var re = new RegExp('ancillary-' + BASE_NAME + '-(.{1,20})-position-(.+?)(?=(\\s|$))', 'gi');
      var bodyClasses = document.body.className.match(re);

      // Check to see if bodyClasses is empty
      if (bodyClasses && bodyClasses[0]) {

        // Loop through all ancillary classes
        bodyClasses.forEach(function (className) {

          // Parse class
          var info = parse(className);

          // Create k/v pairs for each element/position
          positionObject[info.elementName] = info.containerName;

        });

      }

      return positionObject;

    };


    // -------------------------------

    /**
     * Given an element name and container
     * name, insert the element into the
     * proper container. If no element is
     * provided, nothing happens. If no
     * container is provided, remove the
     * element from the DOM.
     *
     * @method syncElement
     * @public
     */

    var syncElement = function (elementName, containerName) {

      var element = elements[elementName];
      var container = containers[containerName];

      if (!element) {

        // Element not found, issue error
        console.error('Element "' + elementName + '"" not found.');

      } else if (container) {

        // Element and container are valid, insert element
        container.appendChild(element);

      } else {

        // No container, remove element
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }

        // Issue warning
        console.warn('Container "' + containerName + '" not found. Removing element "' + elementName + '".');

      }

    };


    // -------------------------------


    /**
     * inRange
     *
     * @method inRange
     * @private
     */
    var inRange = function () {

      if (MIN_WIDTH && MAX_WIDTH) {
        return window.innerWidth > MIN_WIDTH && window.innerWidth <= MAX_WIDTH;
      } else if (MIN_WIDTH) {
        return window.innerWidth > MIN_WIDTH;
      } else if (MAX_WIDTH) {
        return window.innerWidth <= MAX_WIDTH;
      }

      return true;

    };


    // -------------------------------


    /**
     * Collapse method cycles through each
     * container in a collapse group and sees
     * if the combined width of its children
     * exceeds its width (in horizontal mode),
     * or if the width of any one of its
     * children exceeds its width (in stacked
     * mode). If so, it adds the nc-collapse
     * class to the group; if not, it removes.
     *
     * @method collapse
     * @private
     */
    var shouldCollapse = function (groupName) {

      var group = groups[groupName];

      // Loop through all containers in group
      for (var i = 0; i < group.containers.length; i++) {

        var container = group.containers[i];
        var containerName = container.getAttribute('data-nc-container');
        var containerWidth = Math.ceil(parseFloat(window.getComputedStyle(container).width));
        var containerElements = container.querySelectorAll('[data-nc-element]');
        var isStacked = document.body.classList.contains('ancillary-' + BASE_NAME + '-' + containerName + '-layout-stacked');
        var totalWidth = 0;

        // Loop through all elements in container
        for (var j = 0; j < containerElements.length; j++) {
          var containerElement = containerElements[j];
          var elementWidth = containerElement.offsetWidth;

          if (elementWidth > 0 && !isStacked) {
            totalWidth += elementWidth;
          }

          if (isStacked && elementWidth > containerWidth ||
            !isStacked && totalWidth > containerWidth) {

            // Should collapse here.

            if (window.innerWidth > group.breakpoint.min) {
              group.breakpoint.min = window.innerWidth;
            }

            // Collapse
            return true;

          }

        }

      }


      if (window.innerWidth < group.breakpoint.max) {
        group.breakpoint.max = window.innerWidth;
      }

      return false;

    };


    // -------------------------------

    /**
     * syncElements
     *
     * @method syncElements
     * @private
     */

    var syncElements = function () {

      // Sync elements
      for (var elementName in elements) {
        syncElement(elementName, positions[elementName]);
      }


    };


    // -------------------------------

    /**
     * syncCollapse
     *
     * @method syncCollapse
     * @private
     */


    var syncCollapse = function () {

      if (!COLLAPSE) { return false; }

      // Collapse only logic
      if (inRange()) {

        for (var groupName in groups) {

          var group = groups[groupName];

          if (window.innerWidth > group.breakpoint.min && window.innerWidth <= group.breakpoint.max) {

            group.node.removeAttribute('data-nc-collapse');

            if (shouldCollapse(groupName)) {

              group.node.setAttribute('data-nc-collapse', '');

            }

          } else if (window.innerWidth <= group.breakpoint.min) {

            group.node.setAttribute('data-nc-collapse', '');

          } else if (window.innerWidth > group.breakpoint.max) {

            group.node.removeAttribute('data-nc-collapse');

          }

        }

      }

    };


    // -------------------------------



    var RESIZE_TIMEOUT = 100;
    var isDragging = false;
    var _resizeMeasureTimer;

    var onResize = function () {

      if (!isDragging) {
        isDragging = true;
      }

      if (_resizeMeasureTimer) {
        clearTimeout(_resizeMeasureTimer);
      }

      _resizeMeasureTimer = setTimeout(function () {

        syncCollapse();

        isDragging = false;

      }, RESIZE_TIMEOUT);

    };

    // -------------------------------


    var bind = function () {

      window.addEventListener('resize', onResize);

    };


    // -------------------------------

    // Public methods


    return {

      init: function () {

        // Get position settings
        positions = getPositions();

        // Get elements and containers
        elements = getElements();
        containers = getContainers();

        // Collapse only logic
        if (COLLAPSE) {

          // Get groups
          groups = getGroups();

        }

        // Sync
        syncElements();
        syncCollapse();
        bind();

        // add loaded class
        base.classList.add('loaded');

      },

      destroy: function () {

        // Destructor stuff here

      },

      bind: bind,

      sync: function () {

        // Get positions
        positions = getPositions();
      
        syncElements();
        syncCollapse();
      }

    };

  };

})(window.Template.Plugins);