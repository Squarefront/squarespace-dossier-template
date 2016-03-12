(function (Template) {

  'use strict';

  window.Template.Controllers.MobileOverlayFolders = function () {

    var handleClick = function (e) {

      var target = e.target;

      while (target !== this && target.getAttribute('data-controller-folder-toggle') === null) {
        target = target.parentNode;
      }

      var folderID = target.getAttribute('data-controller-folder-toggle');

      if (folderID) {

        // FolderID, folder is being clicked
        var folder = this.querySelector('[data-controller-folder="' + folderID + '"]');

        if (folder) {
          folder.classList.toggle('is-active-folder');
          this.classList.toggle('has-active-folder');
        }

      }


    }.bind(this);

    this.addEventListener('click', handleClick);

  };

})(window.Template);