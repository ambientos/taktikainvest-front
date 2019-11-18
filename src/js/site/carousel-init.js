/**
 * Owl Carousel
 */

$('.carousel-container').each(function(){
	let container = $(this),
		carousel = container.find('.carousel'),
		loop = container.data('loop') || 0,
		margin = container.data('margin') || 0,
		dotsContainer = container.data('dots-container') || 0

	options = {
		items: 1,
		margin: +margin,
		loop: loop,
		nav: false
	}

	if ( dotsContainer ) {
		options.dotsContainer = dotsContainer
	}
	else {
		options.dots = false
	}

	carousel.owlCarousel(options)
})