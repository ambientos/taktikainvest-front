/**
 * Owl Carousel
 */

$('.carousel-container').each(function(){
	let container = $(this),
		carousel = container.find('.carousel'),
		items = +container.data('items') || 1,
		loop = container.data('loop') || 0,
		margin = container.data('margin') || 0,
		nav = container.data('nav') || 0,
		navContainer = container.data('nav-container') || 0,
		dotsContainer = container.data('dots-container') || 0


	options = {
		items: items,
		margin: +margin,
		loop: loop,
		nav: nav,
		navText: ['<i></i>', '<i></i>']
	}


	if ( items === 4 ) {
		options.responsive = {
			0: {
				items: 1
			},
			768: {
				items: 2
			},
			992: {
				items: 3
			},
			1200: {
				items: 4
			}
		}
	}


	if ( navContainer ) {
		options.navContainer = navContainer
	}


	if ( dotsContainer ) {
		options.dotsContainer = dotsContainer
	}
	else {
		options.dots = false
	}


	carousel.owlCarousel(options)
})