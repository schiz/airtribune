$(function() {

  $('.carousel').carousel({
    interval: 7000
  });

  $( '.carousel-collapse' ).on( "click", function() {
		$( this ).parent().toggleClass('carousel-collapsed');

	});

});
