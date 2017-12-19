var select = document.querySelector('#country-select');
var boundList = document.querySelector('#bound-list');
select.addEventListener('change', function(event) {
    if (MarkerClustererHelper) {
        if (select.value != '-') MarkerClustererHelper.map('#map').setCenter(select.value);
        else MarkerClustererHelper.map('#map').setZoom(3);
    }
}, false);
boundList.addEventListener('click', function(event) {
    if (MarkerClustererHelper) {
        MarkerClustererHelper.map('#map').setCenter(event.target.innerText);
    }
}, false);
var options = {
    selector: '#map1',
    imagePath: 'img/',
    service: {
        url: 'locations.txt'
    },
    onMarkerClicked: function(location) {
        document.querySelector('#result-content').innerHTML = ['<h3>', location.country, '</h3><p>', location.id, '<br>', location.city, '<br>', '<img src="img/p', location.type, '.png"><br>', location.lat, '<br>', location.lng, '</p>'].join('');
    },
    onBoundsChnaged: function(locations) {
        var list = [];
        locations.forEach(function(location) {
            var item = '<li>' + location.city + '</li>';
            if (!list.includes(item) && location.city != '-') {
                list.push(item);
            }
        });
        list.sort();
        boundList.innerHTML = list.join('');
    },
    onMarkerHover: function(location) {
        return ['<h3 style="display: initial;">', location.country, '</h3><div>', location.city, '</div>'].join('');
    },
    onLoaded: function(helper) {
        var locations = helper.getLocations();
        var list = [];
        locations.forEach(function(location) {
            var item = '<option value="' + location.country + '">' + location.country + '</option>';
            if (!list.includes(item) && location.country != '-') {
                list.push(item);
            }
        });
        list.sort();
        select.innerHTML = list.join('');
        select.value = "Hungary";
    }
};

function init() {
    MarkerClustererHelper.create({
        service: {
            url: 'locations2.txt',
        },
        imagePath: 'img2/',
    });
    MarkerClustererHelper.create(options);
}