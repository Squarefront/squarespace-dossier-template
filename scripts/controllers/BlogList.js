(function (Template, Core) {

  'use strict';


  // Controller function

  Template.Controllers.BlogList = function () {

    // Get elements from DOM
    var blogListInner = this.querySelector('.BlogList-inner');
    var loadMoreButton = this.querySelector('.BlogList-load');

    // Load next boolean, used by load function
    var loadNext;

    // // Infinite scroll value
    var infiniteScroll = Core.Tweak.getValue('tweak-blog-list-load') === 'Infinite Scroll';

    // // Get mercury
    var mercury = Template.Plugins.mercury.getInstance();

    var edge;


    // ---------------------------------


    var sync = function () {


      var items = Array.prototype.slice.call(blogListInner.querySelectorAll('.BlogList-item'));

      items.forEach(function (item) {

        var image = item.querySelector('.Blog-header-image img');

        if (image) {
          Core.ImageLoader.load(image, {
            load: true,
            mode: 'fill'
          });
        }

      });

      // Sync last page data
      if (blogListInner.querySelector('[data-last-page]')) {
        loadNext = false;
        this.setAttribute('data-last-page-reached', '');
      } else {
        loadNext = true;
      }

      // Sync load edge for infinite scroll
      if (infiniteScroll) {
        edge = blogListInner.getBoundingClientRect().bottom + window.pageYOffset;
      }

    }.bind(this);


    // --------------------------------


    var load = function () {

      if (!loadNext) { return false; }

      // Set loadNext to false so simultaneous loads don't happen
      loadNext = false;

      // Get offset from last blog list item on page
      var blogListItems = blogListInner.querySelectorAll('.BlogList-item');
      var offset = blogListItems[blogListItems.length - 1].getAttribute('data-offset');

      // Construct URL for request
      var url = [
        window.location.pathname,
        window.location.search,
        window.location.search ? '&' : '?',
        'offset=',
        offset,
        '&format=main-content'
      ].join('');

      // Request
      var request = new XMLHttpRequest();
      request.onreadystatechange = function (e) {

        if (e.target.readyState !== XMLHttpRequest.DONE || e.target.status !== 200) {
          return;
        }

        try {

          // Insert html
          blogListInner.insertAdjacentHTML('beforeend', e.target.responseText);

          // Sync
          sync();

          // Add to mercury cache
          if (mercury) {
            mercury.commitCacheEntry(window.location.pathname + window.location.search, '.Main');
          }

          // Allow loads again if not last page
          if (!blogListInner.querySelector('[data-last-page]')) {
            loadNext = true;
          }

        } catch (err) {

          console.error('ERROR:', err);

        }

      };
      request.open('GET', url, true);
      request.send();

    };


    // ---------------------------------

    var loadMoreClick = function (e) {
      e.preventDefault();
      load();
    };


    // ---------------------------------


    var bind = function () {

      // Tweak change
      Core.Tweak.watch(sync);

      // Load on scroll
      Template.Util.scroll(function () {
        if (infiniteScroll && window.pageYOffset + window.innerHeight * 2 > edge) {
          load();
        }
      });

      // Resize
      Template.Util.resizeEnd(sync);

      // Load on click of load more button
      loadMoreButton.addEventListener('click', loadMoreClick);

    };


    // --------------------------------


    var destroy = function () {

      // NOTE:
      // Functionality that is bound using
      // the Template.Util convenience methods
      // resizeEnd and scroll are automatically
      // unbound on mercury:unload and rebound
      // on mercury:load.

      // Load on click of load more button
      loadMoreButton.removeEventListener('click', loadMoreButton);

    };


    // ---------------------------------

    // Init

    bind();
    sync();


    return {

      sync: sync,
      destroy: destroy

    };


  };


})(window.Template, window.SQS);