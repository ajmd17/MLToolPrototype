(function ($) {
  $(document).ready(function () {


    function inputForm2Csv() {
      var csv = '';

      var $inputForm = $('#input-form');
      var $header = $inputForm.find('.header');
      $header.find('h3').each(function (i, el) {
        csv += $(el).html() + ',';
      });
      csv += '\n';

      var $rows = $inputForm.find('.rows');
      $rows.children().each(function (i, el) {
        $(el).children().each(function (i, el) {
          csv += $(el).html() + ',';
        });
        csv += '\n';
      });
      csv += '\n';
      return csv;
    }

    function addColumn(title) {
      var $inputForm = $('#input-form');
      var $header = $inputForm.find('.header');
      var $newHeading = $('<h3>').html(title);

      // add columns
      $inputForm.find('.rows div').each(function (i, el) {
        var $div = $(this);
        $div.append('<span>');
      });
      
      $header.append($newHeading);
      $newHeading.after($('#add-col-btn'));
    }

    function addRow() {
      var $inputForm = $('#input-form');
      var $div = $('<div>');

      // add col for each header
      $inputForm.find('.header h3').each(function (i, el) {
        $div.append('<span>');
      });

      $inputForm.find('.rows').append($div);
    }

    $('#add-col-btn').click(function () {
      var $header = $('#input-form').find('.header');
      addColumn(String.fromCharCode(65 + $header.children().length - 1));
    });

    $('#add-row-btn').click(function () {
      addRow();
    });

    // add starting cells
    /*addColumn('A');
    addColumn('B');
    addColumn('C');
    addColumn('D');
    addRow();*/

    $.ajax({
      method: 'GET',
      url: '/api/models/' + $('#evaluate-btn').attr('data-modelid'),
      contentType: 'application/json'
    }).done(function (res) {
      var shape = res.left.schema.shape;
      console.log('shape = ', shape);

      for (var key in shape) {
        if (Object.prototype.hasOwnProperty.call(shape, key)) {
          addColumn(key);
        }
      }

      addRow();
    }).fail(function (err) {
      alert('Could not load model : ' + err.message);
    });

    $('#export-csv-btn').click(function () {
      var csvString = inputForm2Csv();

      var today = new Date();
      var link = document.createElement("a");
      link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvString));
      link.setAttribute("download", 'testing_' + today.getDate() + '_' + (today.getMonth() + 1) + '_' + today.getFullYear() + '.csv');

      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
    });

    $('#input-form').on('click', '.rows div > span, .header h3', function () {
      var $span = $(this);
      var $input = $('<input type="text">')
        .val($span.html())
        .focusout(function () {
          acceptText();
        })
        .keyup(function (event) {
          if (event.keyCode == 13) {
            acceptText();
          } else if (event.keyCode == 27) {
            removeInput();
          }
        });

      var acceptText = function () {
        if ($input.val().trim().length == 0) {
          alert('Please provide a value.');
        } else {
          $span.html($input.val());
        }

        removeInput();
      };

      var removeInput = function () {
        $span.show();
        $input.remove();
      };

      $span.hide();
      $span.before($input);
      $input.focus();
    });

    var spreadsheetData = Handsontable.helper.createSpreadsheetData(1000, 1000);

    $('#input-table').handsontable({
      rowHeights: 23,
      rowHeaders: true,
      colHeaders: true
    });
    $('#output-table').handsontable({
      rowHeights: 23,
      rowHeaders: true,
      colHeaders: true
    });

    $('#evaluate-btn').click(function () {
      var csvString = inputForm2Csv();

      var $this = $(this);
      var modelId = $this.attr('data-modelid');
      $this.html('Loading...').attr('disabled', 'disabled');

      $.ajax({
        method: 'POST',
        url: '/evaluate/' + modelId,
        contentType: 'application/json',
        data: JSON.stringify({ csv: csvString })
      }).done(function (res) {
        $('#textarea-output').val(res);

        var csvData = res.csvData;

        var data = [];

        var lines = csvData.split('\n');
        for (var i = 0; i < lines.length; i++) {
          data.push(lines[i].split(','));
        }

        $('#input-table').handsontable('loadData', data);
      }).fail(function (err) {
        alert(err.responseJSON.error);
      }).always(function () {
        $this.html('Evaluate').attr('disabled', false);
      });
    });
  });
})(jQuery);