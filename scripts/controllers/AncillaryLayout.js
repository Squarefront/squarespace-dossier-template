(function (Template, Core) {

  'use strict';

  /**
   * The AncillaryLayout controller will
   * generate and init an instance of the
   * ancillary layout module.
   *
   * @function AncillaryLayout
   */

  Template.Controllers.Ancillary = function () {

    // Config options for this particular
    // ancillary layout are all stored on
    // the context element. The ancillary
    // closure accepts no config arguments.

    // Make new layout
    var layout = Template.Plugins.ancillary(this);

    // Init layout
    layout.init();

    // Construct list of tweaks for core
    var tweaks = [
      'ancillary-header-branding-position',
      'ancillary-header-tagline-position',
      'ancillary-header-primary-nav-position',
      'ancillary-header-secondary-nav-position',
      'ancillary-header-search-position',
      'ancillary-header-social-position',
      'ancillary-header-cart-position',
      'ancillary-header-left-layout',
      'ancillary-header-center-layout',
      'ancillary-header-right-layout',
      'tweak-header-element-spacing-horizontal',
      'tweak-header-element-spacing-vertical',
      'tweak-header-branding-logo-width',
      'tweak-header-branding-site-title-font',
      'tweak-header-tagline-font',
      'tweak-header-primary-nav-font',
      'tweak-header-secondary-nav-font',
      'tweak-header-search-style',
      'tweak-header-search-font',
      'tweak-header-social-size',
      'tweak-header-social-style',
      'tweak-header-cart-style',
      'tweak-header-cart-font',
      'ancillary-mobile-bar-branding-position',
      'ancillary-mobile-bar-menu-icon-position',
      'ancillary-mobile-bar-search-icon-position',
      'ancillary-mobile-bar-cart-position'
    ];

    // Handle tweak
    Core.Tweak.watch(tweaks, layout.sync);

  };

})(window.Template, window.SQS);