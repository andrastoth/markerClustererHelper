# MarkerClustererHelper

[![N|Link](https://atandrastoth.co.uk/main/pages/plugins/markerClustererHelper/home.png)](https://atandrastoth.co.uk/main/pages/plugins/markerClustererHelper)

MarkerClusterer Helper help to you to create markerclusterer map in a five minutes.

  - Simple initilazation
  - Simple configuration
  - You can manage multiple maps

![N|Icon](https://atandrastoth.co.uk/main/pages/plugins/markerClustererHelper/icon.png)

Version
----
1.0.0 - 2017-12-19

Initilazation - html -Javascript
----
```sh
<div id="map" style="height: 480px;width:500px;position: relative;overflow: hidden;"></div>

<script type="text/javascript" src="js/markerClustererHelper.js"></script>
<script type="text/javascript"">
function init() {
    var options = {
        service: {
            url: 'locations.txt', // required JSON array from file or service
        }
    };
    MarkerClustererHelper.create(options);
}
</script>
<script type="text/javascript" src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
<script type="text/javascript" async defer src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=init"></script>
```
Object structure
----
```sh
var location = {
	// number: unique identity
    id: 0,
    // number: assigned to images => options.imagePath 'p' + type + '.png' (marker groups: options.imagePath m1.png, m2.png ...)
    type: 0, 
    // latitude  
    lat: 0,
    // longitude
    lng: 0,
    /*
        your properties
    */
};
```
Default options
----
```sh
var def = {
    selector: '#map',
    imagePath: 'img/',
    service: {
        url: 'locations.txt',
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
    }
}
```
Usage - methods
----
```sh
// create map
MarkerClustererHelper.create(options); 
// destroy map - identity: index or queryselector for map 
MarkerClustererHelper.destroy(identity);
// get helper for map - identity: index or queryselector for map 
MarkerClustererHelper.map(identity);
// set center on map arg: string Country name or City name etc. or index (location.id) or lat-lng object
MarkerClustererHelper.map(identity).setCenter(arg);
// set zoom number
MarkerClustererHelper.map(identity).setZoom(arg);
// select location, arg: location.id
MarkerClustererHelper.map(identity).setSelected(arg);
// clear selected state
MarkerClustererHelper.map(identity).clearSelected();
MarkerClustererHelper.map(identity).redraw();
// clear all locations from map
MarkerClustererHelper.map(identity).clear();
// reload 
MarkerClustererHelper.map(identity).reload();
// load more, based on service opject: service: {url: 'URL', (optional)token: { name: '', value: '' } } or location array
MarkerClustererHelper.map(identity).load(service);
// returns locations array
MarkerClustererHelper.map(identity).getLocations();
// returns visible locations array
MarkerClustererHelper.map(identity).getVisibleLocations();
// returns helper options
MarkerClustererHelper.map(identity).options;
```
License
----

MIT

Author: Tóth András
---
http://atandrastoth.co.uk/