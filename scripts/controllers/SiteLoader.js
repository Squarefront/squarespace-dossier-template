(function (Template, Core) {

  'use strict';

  // Exceptions: external links, hash links
  var onClickExceptions = [
    '[href^="http"]',
    '[href^="#"]',
    '[href^="/#"]',
    '[target="_blank"]',
    '[data-no-ajax]',
    'a:not([href])'
  ];

  // Exceptions after making the request.
  // Does a string match for any of these
  // in the responseText
  var onRequestExceptions = [
    'sqs-slide-container'
  ];

  // updateMatrix indicates which elements
  // need to be updated on load. You can
  // choose whether to update attributes,
  // replace HTML, or both.
  var updateMatrix = [
    { selector: 'title', updateHTML: true },
    { selector: 'meta[property="og:title"]', updateAttrs: true },
    { selector: 'meta[property="og:latitude"]', updateAttrs: true },
    { selector: 'meta[property="og:longitude"]', updateAttrs: true },
    { selector: 'meta[property="og:url"]', updateAttrs: true },
    { selector: 'meta[property="og:type"]', updateAttrs: true },
    { selector: 'meta[property="og:description"]', updateAttrs: true },
    { selector: 'meta[property="og:image"]', updateAttrs: true },
    { selector: 'meta[itemprop="name"]', updateAttrs: true },
    { selector: 'meta[itemprop="url"]', updateAttrs: true },
    { selector: 'meta[itemprop="description"]', updateAttrs: true },
    { selector: 'meta[itemprop="thumbnailUrl"]', updateAttrs: true },
    { selector: 'meta[itemprop="image"]', updateAttrs: true },
    { selector: 'meta[name="twitter:title"]', updateAttrs: true },
    { selector: 'meta[name="twitter:image"]', updateAttrs: true },
    { selector: 'meta[name="twitter:url"]', updateAttrs: true },
    { selector: 'meta[name="twitter:card"]', updateAttrs: true },
    { selector: 'meta[name="twitter:description"]', updateAttrs: true },
    { selector: 'meta[name="twitter:url"]', updateAttrs: true },
    { selector: 'meta[name="description"]', updateAttrs: true },
    { selector: 'link[rel="canonical"]', updateAttrs: true },
    { selector: 'link[rel="image_src"]', updateAttrs: true },
    { selector: 'link[rel="alternate"]', updateAttrs: true },
    { selector: 'body', updateAttrs: true },
    // { selector: '.Header', updateAttrs: true },
    { selector: '.Header-nav--primary', updateHTML: true },
    { selector: '.Header-nav--secondary', updateHTML: true },
    { selector: '.Footer-nav', updateHTML: true },
    { selector: '.Main', updateHTML: true, updateAttrs: true }
  ];


  Template.Controllers.SiteLoader = function () {

    // Don't use ajax in authenticated session
    // or when tweak option is disabled.
    var auth = Template.Constants.AUTHENTICATED;
    var ajaxEnabled = Core.Tweak.getValue('tweak-site-ajax-loading-enable') === 'true';
    if (auth || !ajaxEnabled) {
      return false;
    }

    // Get instance of singleton and bind functionality
    Template.Plugins.mercury.getInstance({

      useHistory: true,
      cacheMode: 'manual',
      updateMatrix: updateMatrix,
      onClickExceptions: onClickExceptions,
      onRequestExceptions: onRequestExceptions

    }).bind();


    // Sync controllers on ajax load
    window.addEventListener('mercury:load', window.SQSControllerSync);


  };

})(window.Template, window.SQS);