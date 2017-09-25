(function ($) {
  function getAllUploads(cb) {
    $.ajax({
      method: 'GET',
      url: '/api/uploads'
    }).done(function (res) {
      cb(null, res);
    }).fail(function (err) {
      cb(err, null);
    });
  }

  $(document).ready(function () {
    var $uploadsSection = $('#uploads-section');
    var $uploadsContent = $uploadsSection.find('#uploads-content');

    getAllUploads(function (err, res) {
      if (err) {
        alert('oh no: ', err.message);
      } else {
        var $ul = res.reduce(function (accum, el) {
          return accum.append($('<li>').append(
            $('<h4>' + el.name + '</h5>')
          ).append(
            $('<a href="/' + el.filepath + '">download</a>')
          ).append(
            $('<a href="/demo/' + encodeURIComponent(el._id) + '">demo</a>')
          ).append(
            $('<span>' + moment(el.timestamp).fromNow() + '</span>')
          ));
        }, $('<ul>'));
        $uploadsContent.html($ul);
      }
    });

    var $mainUploadForm = $('#main-upload-form');

    $('#upload-form button').click(function () {
      var $this = $(this);
      var modelType = $this.attr('data-modeltype');
      
      // find main form, set 'action' attribute on it to be the action from above

      $mainUploadForm.find('input[name=modeltype]').attr('value', modelType);
      $this.before($mainUploadForm.show());
      $('#upload-form button').not($this).show();
      $this.hide();
    });
  });
})(jQuery);