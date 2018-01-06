var select = document.querySelector('#country-select');
var boundList = document.querySelector('#bound-list');
select.addEventListener('change', function(event) {
    if (typeof MarkerClustererHelper != 'undefined') {
        if (select.value != '-') MarkerClustererHelper.map('#map1').setCenter(select.value);
        else MarkerClustererHelper.map('#map1').setZoom(3);
    }
}, false);
boundList.addEventListener('click', function(event) {
    if (typeof MarkerClustererHelper != 'undefined') {
        var location = MarkerClustererHelper.map('#map1').getLocations().find(function(item) {
            return item.city == event.target.innerText;
        });
        MarkerClustererHelper.map('#map1').setCenter(location.country + ' ' + location.city);
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
            if (!list.includes(location.country) && location.country != '-') {
                list.push(location.country);
                var opt = document.createElement('option');
                opt.value = location.country;
                opt.innerText = location.country;
                select.appendChild(opt);            
            }
        });
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
