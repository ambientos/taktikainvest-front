let noUiSlider = require('nouislider')


/**
 * Get all Slider Elements
 */

sliderContainersCollect = document.querySelectorAll('.form-slider-container')


/**
 * Each Sliders Elements
 */

sliderContainersCollect.forEach(function(sliderContainer, i){
	let slider = sliderContainer.querySelector('.form-slider'),
		min = +slider.dataset.min,
		max = +slider.dataset.max


	/**
	 * Init noUiSlider
	 */

	noUiSlider.create(slider, {
		start: [200, 600],
		connect: true,
		range: {
			'min': min,
			'max': max
		}
	})


	/**
	 * Add Slider labels
	 */
	
	sliderContainer.insertAdjacentHTML('beforeend', `
		<div class="form-slider-label">
			<span class="form-slider-from">${min}</span> &mdash; 
			<span class="form-slider-to">${max}</span> 
			м<sup>2</sup>
		</div>
	`)

	let sliderLabelFrom = sliderContainer.querySelector('.form-slider-from'),
		sliderLabelTo = sliderContainer.querySelector('.form-slider-to')


	/**
	 * Update labels data
	 */
	
	slider.noUiSlider.on('update', function(values, handle){
		sliderLabelFrom.innerHTML = Number(values[0]).toFixed()
		sliderLabelTo.innerHTML = Number(values[1]).toFixed()
	})
})