function Map(options) {
    this._mapOptions = $.extend({
        type: 'estate',
        estate_id: 0,
        selector: 'map-container',
        coords: [55.76, 37.64],
        zoom: 10,
        addedIds: [],
        data: [],
        controls: ['zoomControl']
    }, options);
}

Map.prototype._applyPlugins = function () {
    ymaps.ready(init);
    var map;
    var options = this._mapOptions;
    var placemarks = {
        "type": "FeatureCollection",
        "features": []
    };

    function init() {
        map = new ymaps.Map(options.selector, {
            center: options.coords,
            zoom: options.zoom,
            data: options.data,
            controls: options.controls
        });
        var clusterIcons = [
            {
                href: '',
                size: [30, 30],
                offset: [-15, -15]
            }
        ];
        /*Placemark*/
        var customClusterIconLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="cluster-icon">$[properties.geoObjects.length]</div>'
        );
        var customPlacemarkLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="placemark-icon"></div>'
        );
        /*Balloon*/
        var customBalloonLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="balloon-wrapper">$[[options.contentLayout]]</div>', {
                build: function () {
                    this.constructor.superclass.build.call(this);
                    this._$element = $('.balloon-wrapper', this.getParentElement());
                    this.applyElementOffset();
                    this._$element
                        .find('.balloon__close')
                        .on('click', $.proxy(this.onCloseClick, this));

                    if(typeof lexinvest !== 'undefined')
                    {
                        this._$element
                            .find('[data-favorite] input[type="checkbox"]')
                            .on('change', lexinvest.favorite);
                    }
                },
                clear: function () {
                    this._$element.find('.balloon__close').off('click');
                    this.constructor.superclass.clear.call(this);
                },
                onSublayoutSizeChange: function () {
                    customBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);
                    if (!this._isElement(this._$element)) {
                        return;
                    }
                    this.applyElementOffset();
                    this.events.fire('shapechange');
                },
                applyElementOffset: function () {
                    this._$element.css({
                        left: -(this._$element[0].offsetWidth / 2 + 60),
                        top: -(this._$element[0].offsetHeight + 15)
                    });
                },
                onCloseClick: function (e) {
                    e.preventDefault();
                    this.events.fire('userclose');
                },
                getShape: function () {
                    if (!this._isElement(this._$element)) {
                        return customBalloonLayout.superclass.getShape.call(this);
                    }
                    var position = this._$element.position();

                    return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                        [position.left, position.top],
                        [
                            position.left + this._$element[0].offsetWidth,
                            position.top + this._$element[0].offsetHeight
                        ]
                    ]
                    ));
                },
                _isElement: function (element) {
                    return element && element[0];
                }
            }
        );

        var customBalloonContentLayout = ymaps.templateLayoutFactory.createClass([
            '<div class="balloon-overlay"> \
                <div class="balloon-estate-container"> \
                    <div class="balloon__close"> \
                        <i class="far fa-times-circle"></i> \
                    </div> \
                    <a href="{{ properties.url }}" class="balloon-estate__pic"> \
                        <img src="{{ properties.pic }}" alt="{{ properties.name }}" /> \
                        {% if properties.hot <= 0 %} \
                        <div class= "balloon-estate__badges"> \
                            <span class="badge bg-primary badge-pill text-white">Срочная продажа</span> \
                        </div> \
                        {% endif %} \
                    </a> \
                    <div class="balloon-estate__info"> \
                        {% if properties.rooms %} \
                        <div class="balloon-estate__info-item"> \
                            <div class="balloon-estate__info-title">Комнат</div> \
                            <div class="balloon-estate__info-value">{{ properties.rooms }}</div> \
                        </div > \
                        {% endif %} \
                        {% if properties.area %} \
                        <div class="balloon-estate__info-item"> \
                            <div class="balloon-estate__info-title">Площадь</div> \
                            <div class="balloon-estate__info-value">{{ properties.area }}</div> \
                        </div> \
                        {% endif %} \
                        {% if properties.district %} \
                        <div class="balloon-estate__info-item"> \
                            <div class="balloon-estate__info-title">{{ properties.district }}</div> \
                            <div class="balloon-estate__info-value">{{ properties.address }}</div> \
                        </div> \
                        {% endif %} \
                        {% if properties.price %} \
                        <div class="balloon-estate__info-item"> \
                            <div class="balloon-estate__info-title">Цена</div> \
                            <div class="balloon-estate__info-value">{{ properties.price }}</div> \
                        </div> \
                        {% endif %} \
                    </div> \
                    <div class="balloon-estate__link"> \
                        <a href="{{ properties.url }}"> \
                        Подробнее \
                        </a> \
                    </div> \
                </div> \
            </div>'
        ].join('')
        );
        /*Map controls and events*/
        map.behaviors.disable('scrollZoom');

        if ($('html').hasClass('bx-touch')) {
            map.behaviors.disable('drag');
        }

        /*Object manager and clusterization*/
        var objectManager = new ymaps.ObjectManager({
            clusterize: true,
            clusterDisableClickZoom: false,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonPanelMaxMapArea: 0,
            clusterBalloonContentLayoutWidth: 278,
        });
        objectManager.objects.options.set({
            iconLayout: customPlacemarkLayout,
            iconShape: {
                type: 'Rectangle',
                coordinates: [
                    [0, 0], [30, 30]
                ],
            },
            iconOffset: [-15, -15],
            balloonLayout: customBalloonLayout,
            balloonContentLayout: customBalloonContentLayout,
            balloonPanelMaxMapArea: 0,
           // balloonOffset: [-213, -353],
            balloonCloseButton: false,
            open: function(e) {
               // console.log('cl')
            }
        });
        objectManager.clusters.options.set({
            clusterIcons: clusterIcons,
            clusterIconContentLayout: customClusterIconLayout,
        });

        function request(first) {
            if (first === undefined) {
                first = false;
            }
            var params = $('#estate-fiter').serialize() + '&bounds=' + map.getBounds().join(',') + '&first=' + first + '&action=sitemechAjaxMapCords';
            var jqxhr = $.getJSON( '/wp-admin/admin-ajax.php' + '?' + params, {
                format: 'json'
            }).done(function (json) {
                $.each(json.items, function ( i, item ) {
                    var placemark = {
                        type: 'Feature',
                        id: i,
                        geometry: {
                            type: 'Point',
                            coordinates: item,
                        },
                        options: {
                            iconLayout: customPlacemarkLayout,
                        },
                        properties: {
                            placemarkId: i,
                        },
                    };

                    placemarks.features.pushIfNotExist(placemark, function (e) {
                        return e.id === placemark.id;
                    });
                });

                objectManager.add(placemarks);

                if (first === true) {
                    map.geoObjects.add(objectManager);
                    if (options.estate_id <= 0 && map.geoObjects.getBounds()) {
                        map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true });
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            });
        }

        request(true);

        map.events.add('boundschange', function () {
            request();
        });

        // Check data
        function hasBalloonData(objectId) {
            return objectManager.objects.getById(objectId).properties.balloonContent;
        }
        // Get object by id and set to collection
        function setBalloonData(objectId) {
            if (!hasBalloonData(objectId)) {
                var jqxhrObjectData = $.getJSON('/wp-admin/admin-ajax.php?id=' + objectId + '&action=sitemechAjaxMapData', {
                    format: 'json'
                }).done(function (json) {
                    var object = objectManager.objects.getById(objectId);
                    var json_data = json[objectId];

                    object.properties = {
                        id: json_data.id || null,
                        pic: json_data.pic || null,
                        url: json_data.url || null,
                        hot: json_data.hot || null,
                        name: json_data.name || null,
                        rooms: json_data.rooms || null,
                        price: json_data.price || null,
                        price_meter: json_data.price_meter || null,
                        district: json_data.district || null,
                        floors: json_data.floors || null,
                        address: json_data.address || null,
                        area: json_data.area || null,
                        balloonContentBody: '<a href="' + json_data.url + '" target="_blank" class="estate-cluster"> \
                                                <div class="estate-cluster-title">' + json_data.name + '</div> \
                                                <div class="estate-cluster-price">' + json_data.price + '</div> \
                                                <div class="estate-cluster-address">' + json_data.address + '</div></a>'
                    }
                    var objectState = objectManager.getObjectState(objectId);
                    if (!objectState.isClustered) {
                        objectManager.objects.balloon.open(objectId);
                    } else {
                        objectManager.clusters.balloon.open(objectState.cluster.id);
                    }
                });
            }
        };

        objectManager.objects.events.add('click', function (e) {
            var objectId = e.get('objectId');
            setBalloonData(objectId);
        });

        //Monitor cluster changes
        var activeObjectMonitor = new ymaps.Monitor(objectManager.clusters.state);
        activeObjectMonitor.add('activeObject', function () {
            var objectId = activeObjectMonitor.get('activeObject').id;
            setBalloonData(objectId);
        });
    }
};
Map.prototype.apply = function () {
    this._applyPlugins();
};

export default Map