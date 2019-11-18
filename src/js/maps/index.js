let $map = $('.map')

if ( $map.length ) {
	let _data = $map.data('map'),
		_id   = $map.attr('id')

	ymaps.ready(function() {
		let map = new ymaps.Map(_id, {
				center: [_data.latitude, _data.longitude],
				zoom: _data.zoom || 14,
				controls : ['zoomControl']
			}, {
				searchControlProvider: 'yandex#search'
			}),
			mapGeoObject = new ymaps.GeoObject({
				geometry: {
					type: "Point",
					coordinates: [_data.latitude, _data.longitude]
				},
			}, {
				preset: 'islands#blackStretchyIcon'
			});

		map.behaviors.disable('scrollZoom');

		map.geoObjects.add(mapGeoObject);
	})
}