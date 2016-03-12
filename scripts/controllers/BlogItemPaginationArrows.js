(function (Template, Core) {

  'use strict';

  var LOADED_CLASS = 'BlogItem-pagination--loaded';
  var OVERLAY_CLASS = 'BlogItem-pagination--overlay';
  var TWEAKING_CLASS = 'BlogItem-pagination-link--tweaking';

  Template.Controllers.BlogItemPaginationArrows = function () {

    var range = {
      top: -1,
      bottom: -1
    };
    var blogItemHeader = document.body.querySelector('.Blog-header');

    var siteBorderShow;
    var blogItemPaginationOption;
    var borderWidth = 0;


    var paginationLinkPrev = this.querySelector('.BlogItem-pagination-link--prev');
    var paginationLinkNext = this.querySelector('.BlogItem-pagination-link--next');

    var arrowIconStyle = window.getComputedStyle(this.querySelector('.BlogItem-pagination-icon'));
    var arrowWidth = parseFloat(arrowIconStyle.paddingLeft) + parseFloat(arrowIconStyle.width);
    var arrowPosition = window.innerHeight / 2;

    // ---------------------------------

    var overlapsBorder = function () {

      // Stop if border is wider
      // than where icon appears.

      return siteBorderShow && borderWidth >= arrowWidth;

    };

    // ---------------------------------


    var onKeydown = function (e) {

      if (blogItemPaginationOption !== 'Floating' || Template.Constants.AUTHENTICATED) { return false; }

      if (e.keyCode === 37 && paginationLinkPrev) {
        e.preventDefault();
        paginationLinkPrev.click();
      } else if (e.keyCode === 39 && paginationLinkNext) {
        e.preventDefault();
        paginationLinkNext.click();
      }

    };


    // ---------------------------------


    var onScroll = function () {

      if (blogItemPaginationOption !== 'Floating') { return false; }
      if (overlapsBorder()) { return false; }

      var inRange = window.pageYOffset > range.top - arrowPosition && window.pageYOffset < range.bottom - arrowPosition;

      this.classList.toggle(OVERLAY_CLASS, inRange);

    }.bind(this);


    // ---------------------------------


    var sync = function () {

      // Get pagination option
      blogItemPaginationOption = Core.Tweak.getValue('tweak-blog-item-pagination');
      if (blogItemPaginationOption !== 'Floating') { return false; }

      // Sync border
      siteBorderShow = Core.Tweak.getValue('tweak-site-border-show') === 'true';
      borderWidth = parseFloat(Core.Tweak.getValue('tweak-site-border-width'));
      if (overlapsBorder()) {
        this.classList.add(LOADED_CLASS);
        return false;
      }

      // Sync header
      var blogItemHeaderOption = Core.Tweak.getValue('tweak-blog-item-header');

      var rect;

      if (blogItemHeaderOption === 'Full Bleed') {
        range = {
          top: 0,
          bottom: window.innerHeight
        };
      } else if (blogItemHeaderOption === 'Full Width Banner') {
        rect = blogItemHeader.getBoundingClientRect();
        range = {
          top: rect.top + window.pageYOffset,
          bottom: rect.bottom + window.pageYOffset
        };
      }

      onScroll();

      this.classList.add(LOADED_CLASS);

    }.bind(this);



    // ---------------------------------

    // Init & bind

    sync();
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', sync);
    window.addEventListener('keydown', onKeydown);

    // Tweak list for sync
    var syncTweaks = [
      'tweak-site-border-show',
      'tweak-site-border-width',
      'tweak-blog-item-pagination'
    ];
    Core.Tweak.watch(syncTweaks, sync);

    // Tweak list to show
    var tweakingTweaks = [
      'tweak-blog-item-pagination',
      'tweak-blog-item-pagination-title-font',
      'tweak-blog-item-pagination-title-font-font-family',
      'tweak-blog-item-pagination-title-font-font-weight',
      'tweak-blog-item-pagination-title-font-font-style',
      'tweak-blog-item-pagination-title-font-font-size',
      'tweak-blog-item-pagination-title-font-text-transform',
      'tweak-blog-item-pagination-title-font-letter-spacing',
      'tweak-blog-item-pagination-title-color',
      'tweak-blog-item-pagination-meta',
      'tweak-blog-item-pagination-meta-font',
      'tweak-blog-item-pagination-meta-font-font-family',
      'tweak-blog-item-pagination-meta-font-font-weight',
      'tweak-blog-item-pagination-meta-font-font-style',
      'tweak-blog-item-pagination-meta-font-font-size',
      'tweak-blog-item-pagination-meta-font-text-transform',
      'tweak-blog-item-pagination-meta-font-letter-spacing',
      'tweak-blog-item-pagination-meta-color'
    ];

    var toggleTweakingClass = function (tweak) {

      var isTweaking = window.innerWidth > Template.Constants.MOBILE_BREAKPOINT &&
                       tweak.name &&
                       tweakingTweaks.indexOf(tweak.name) >= 0;

      var paginationLink = paginationLinkPrev || paginationLinkNext;

      if (paginationLink) {
        paginationLink.classList.toggle(TWEAKING_CLASS, isTweaking);
      }

    };
    Core.Tweak.watch(toggleTweakingClass);




    // ---------------------------------



    return {

      destroy: function () {

        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', sync);
        window.removeEventListener('keydown', onKeydown);

      }

    };

  };



})(window.Template, window.SQS);