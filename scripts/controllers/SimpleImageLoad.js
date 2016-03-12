
(function (Template, Core) {

  'use strict';

  Template.Controllers.SimpleImageLoad = function () {


    var load = function () {


      var images = this.querySelectorAll('img[data-src]');

      for (var i = 0; i < images.length; i++) {

        var image = images[i];
        var imageWrapper = image.parentNode;
        var mode = null;

        if (imageWrapper.classList.contains('content-fill')) {
          mode = 'fill';
        } else if (imageWrapper.classList.contains('content-fit')) {
          mode = 'fit';
        }

        Core.ImageLoader.load(images[i], {
          load: true,
          mode: mode
        });

      }



    }.bind(this);

    // Bind resize handler
    Template.Util.resizeEnd(load, this);

    // Tweak handler
    var tweaksFromDOM = this.getAttribute('data-tweaks');

    if (tweaksFromDOM && tweaksFromDOM.length > 0) {

      var tweaks = tweaksFromDOM.split(',').map(function (tweakName) {
        return tweakName.trim();
      });

      Core.Tweak.watch(tweaks, load);

    }

    // Init
    load();

  };


})(window.Template, window.SQS);
