(function (Template, Core) {

  'use strict';


  // Controller function

  Template.Controllers.SiteScroll = function () {

    var timeout;

    var resetPointerEvents = function () {

      timeout = null;
      this.style.pointerEvents = '';

    }.bind(this);

    var onScroll = function () {

      this.style.pointerEvents = 'none';

      clearTimeout(timeout);

      timeout = setTimeout(resetPointerEvents, 300);

    }.bind(this);

    window.addEventListener('scroll', onScroll);

  };



})(window.Template, window.SQS);