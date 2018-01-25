/*!
 * MarkerClustererHelper 1.0.0
 * Author: Tóth András
 * Web: http://atandrastoth.co.uk
 * email: atandrastoth@gmail.com
 * Licensed under the MIT license
 */
var MarkerClustererHelper = (function() {
	'use strict';
	var helpers = [];
	var def = {
		selector: '#map',
		imagePath: 'img/',
		service: {
			url: '',
			token: {
				name: '',
				value: ''
			}
		},
		defaultCountry: '',
		zoom: 7,
		maxZoom: 14,
		gridSize: 60,
		onLoaded: function(helper) {},
		onMarkerClicked: function(location) {},
		onMarkerHover: function(location) {
			return ['<h3 style="display: initial;">id: ', location.id, '</h3><div>type: ', location.type, '</div><div>lat: ', location.lat, '</div><div>lng: ', location.lng, '</div>'].join('');
		},
		onBoundsChnaged: function() {},
		onError: function(e) {
			console.error(e);
		},
		markerCluster: function() {
			return {
				maxZoom: this.maxZoom,
				gridSize: this.gridSize,
				imagePath: this.imagePath + 'm'
			}
		}
	};

	function Helper(opt) {
		var helper;
		var markers = [],
			markerCluster,
			loader, map, geocoder, infowindow, onBoundsChnagedTimeout;
		String.prototype.toDOM = function() {
			var d = document,
				i, a = d.createElement("div"),
				b = d.createDocumentFragment();
			a.innerHTML = this;
			while (i = a.firstChild) b.appendChild(i);
			return b;
		};

		function init(self) {
			helper = self;
			loader = ['<img id="loader" style="background: white; position: absolute;z-index: 1;width: 100%;height: 100%; top:0; left: 0;" src="', opt.imagePath, 'loading.gif">'].join('').toDOM().querySelector('img');
			map = new google.maps.Map(document.querySelector(opt.selector), {
				zoom: opt.zoom
			});
			map.addListener('bounds_changed', function() {
				clearTimeout(onBoundsChnagedTimeout);
				onBoundsChnagedTimeout = setTimeout(function() {
					if (typeof opt.onBoundsChnaged == 'function') {
						opt.onBoundsChnaged(getLocations(true));
					}
				}, 300);
			});
			geocoder = new google.maps.Geocoder();
			infowindow = new google.maps.InfoWindow({});
			load(opt.service);
		}

		function load(service) {
			if (Array.isArray(service)) {
				document.querySelector(opt.selector).appendChild(loader);
				setTimeout(function() {
					try {
						setMarkers(service);
						if (typeof opt.onLoaded == 'function') {
							opt.onLoaded(helper);
						}
					} catch (e) {
						if (typeof opt.onError == 'function') {
							opt.onError(e);
						}
					}
				}, 300);
			} else if (service.url) {
				document.querySelector(opt.selector).appendChild(loader);
				var data = null;
				var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				xhr.addEventListener("readystatechange", function() {
					if (this.readyState === 4) {
						if (this.status === 200) {
							try {
								setMarkers(JSON.parse(this.responseText));
								if (typeof opt.onLoaded == 'function') {
									opt.onLoaded(helper);
								}
							} catch (e) {
								if (typeof opt.onError == 'function') {
									opt.onError(e);
								}
							}
						} else {
							if (typeof opt.onError == 'function') {
								opt.onError(this.statusText);
							}
						}
					}
				});
				xhr.open("GET", service.url);
				xhr.setRequestHeader("Cache-Control", "no-cache");
				if (service.token.name) {
					xhr.setRequestHeader(service.token.name, service.token.value);
				}
				xhr.send(data);
			} else if (typeof opt.onError == 'function') {
				opt.onError(new Error('Wrong imput parameter on helper.load(param)\nIt must be location array or service object!'));
			}
		}

		function setMarkers(newLocations) {
			var oldLocations = JSON.parse(JSON.stringify(getLocations()));
			if (markerCluster == null) {
				markerCluster = new MarkerClusterer(map, [], opt.markerCluster());
			} else {
				clear();
			}
			var locations = newLocations.concat(oldLocations);
			markers = locations.map(function(location, i) {
				return new google.maps.Marker({
					position: {
						lat: Number(location.lat),
						lng: Number(location.lng)
					},
					icon: opt.imagePath + 'p' + location.type + '.png',
					location: location
				});
			});
			markers.forEach(function(marker, index) {
				marker.addListener('click', function() {
					setSelected(markers[index].location.id);
					if (typeof opt.onMarkerClicked == 'function') {
						opt.onMarkerClicked(markers[index].location)
					}
				});
				marker.addListener('mouseover', function() {
					if (typeof opt.onMarkerHover == 'function') {
						infowindow.setContent(opt.onMarkerHover(markers[index].location));
						infowindow.open(map, marker);
					}
				});
			});
			markerCluster.addMarkers(markers, true);
			if (opt.defaultCountry) {
				setCenter(opt.defaultCountry);
			} else {
				fitBounds(markers);
			}
			removeElement(loader);
		}

		function fitBounds(marks) {
			var bounds = new google.maps.LatLngBounds();
			for (var i = 0; i < marks.length; i++) {
				bounds.extend(marks[i].getPosition());
			}
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());
		}

		function setSelected(id, force) {
			markers.forEach(function(marker, index) {
				if (marker.location.id == id) {
					marker.setAnimation(google.maps.Animation.BOUNCE);
					if (force && typeof opt.onMarkerClicked == 'function') {
						opt.onMarkerClicked(marker.location)
					}
				} else {
					marker.setAnimation(null);
				}
			});
		}

		function setCenter(argument) {
			if (typeof argument == 'number') {
				for (var i in markers) {
					if (markers[i].location.id == argument) {
						map.setCenter({
							lat: markers[i].position.lat(),
							lng: markers[i].position.lng()
						});
						setZoom(16);
						break;
					}
				}
			} else
			if (typeof argument == 'string') {
				getLocationFromAddress(argument, function(results) {
					map.setCenter(results[0].geometry.location);
					map.fitBounds(results[0].geometry.viewport);
				});
			} else if (typeof argument == 'object') {
				map.setCenter({
					lat: argument.lat,
					lng: argument.lng
				});
				setZoom(16);
			}
			return this;
		}

		function getLocationFromAddress(addr, onReady) {
			if (geocoder) {
				geocoder.geocode({
					address: addr
				}, function(res, status) {
					if (status == 'OK') {
						return onReady(res);
					} else {
						console.warn('Geocode was not successful for the following reason: ' + status);
					}
				});
			}
			return false;
		}

		function removeElement(el) {
			el && el.parentNode && el.parentNode.removeChild(el);
		}

		function redraw() {
			google.maps.event.trigger(map, 'resize');
		}

		function setZoom(arg) {
			map.setZoom(arg);
		}

		function clear() {
			markerCluster.clearMarkers();
			markers = [];
		}

		function getLocations(visible) {
			var locations = [];
			markers.forEach(function(marker, index) {
				if (!visible || map.getBounds().contains(marker.getPosition())) {
					locations.push(marker.location);
				}
			});
			return locations;
		}
		return {
			init: function() {
				init(this);
			},
			setCenter: function(arg) {
				setCenter(arg);
				return this;
			},
			setZoom: function(arg) {
				setZoom(arg);
				return this;
			},
			setSelected: function(arg) {
				setSelected(arg, true);
				setCenter(arg);
				return this;
			},
			clearSelected: function() {
				setSelected(-1);
				return this;
			},
			redraw: function() {
				redraw();
				return this;
			},
			clear: function() {
				clear();
				return this;
			},
			reload: function() {
				clear();
				load(opt.service);
			},
			load: function(service) {
				load(service);
			},
			getLocations: function() {
				return getLocations(false);
			},
			getVisibleLocations: function() {
				return getLocations(true);
			},
			get options() { 
				return opt;
			}
		}
	}

	function mergeObjects() {
		var resObj = arguments[0];
		for (var i = 1; i < arguments.length; i += 1) {
			var obj = arguments[i],
				keys = Object.keys(obj);
			for (var j = 0; j < keys.length; j += 1) {
				if (typeof resObj[keys[j]] == 'object') {
					resObj[keys[j]] = mergeObjects({}, resObj[keys[j]], obj[keys[j]]);
				} else {
					resObj[keys[j]] = obj[keys[j]];
				}
			}
		}
		return resObj;
	}

	function create(options) {
		var opt = mergeObjects({}, def, typeof options == 'object' ? options : {});
		var exists = helpers.filter(function(helper) {
			return helper.options.selector == opt.selector;
		});
		if (exists.length == 0) {
			var helper = new Helper(opt);
			helpers.push(helper);
			helper.init();
		} else {
			console.warn('Map {selector: ' + opt.selector + '} already added!');
		}
	}

	function map(identity) {
		var founded = helpers.filter(function(helper, index) {
			return (typeof identity == 'number' && index == identity) || (typeof identity == 'string' && helper.options.selector == identity);
		});
		if (founded.length == 1) {
			return founded[0];
		} else {
			console.error('Map {identity: ' + identity + '} not exists!');
			return null;
		}
	}

	function destroy(identity) {
		var founded = helpers.filter(function(helper, index) {
			return (typeof identity == 'number' && index == identity) || (typeof identity == 'string' && helper.options.selector == identity);
		});
		if (founded.length == 1) {
			document.querySelector(founded[0].options.selector).innerHTML = '';
			helpers.splice(helpers.indexOf(founded[0]), 1);
		} else {
			console.error('Map {identity: ' + identity + '} not exists!');
			return null;
		}
	}
	return {
		create: function(options) {
			create(options);
		},
		map: function(identity) {
			return map(identity);
		},
		destroy: function(identity) {
			destroy(identity);
		},
	}
})();
