//= routing.js
//= browsers.js
//= vendor/jquery/ui.min.js
//= vendor/jquery/scrollbar/min.js
//= dateRange.js
//= scroll.js

//= classes/PSeu.js
let room = new PSeu();

let switchLimit = (e) => {

  // on any limit click - remove active from all limits and add it to clicked limit
  $('.limits__item').removeClass('limits__item--active');
  $(e).parent().addClass('limits__item--active');

  // if date range filter is clicked
  if (room.isFiltered) {
    room.draw(room.filtered, $(e).data('limit'));
  } else
      room.draw(room.tournaments, $(e).data('limit'));
};

$(document).ready(function() {

  window.location.hash = '#';

  $('.nav__link').on('click', function(e) {
    if ($(this).hasClass('nav__link--disabled')) e.preventDefault();
  });

  $('.date-range__ranges').on('click', function() {
    $(this).toggleClass('date-range__ranges--open');
  });

  // on each hash change start render process
  $(window).on('hashchange', function() {
      render(decodeURI(window.location.hash));
  });

  // when user set folder
  $('#file-input').on('change', function() {

      let files = $(this)[0].files;
      if (files.length > 0) room.parseAll(files);

  });

  $('#file-input').on('click', function() {
    $('#selecting').removeClass('hidden');
  });

  $('#selecting').on('click', function() {
      $('#selecting').addClass('hidden');
  });

});
