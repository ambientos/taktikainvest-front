let $contactsMap = $('.contacts-map')

if ( $contactsMap.length ) {
	let _data = $contactsMap.data('map'),
		_id   = $contactsMap.attr('id')

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