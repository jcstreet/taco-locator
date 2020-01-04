'use strict'

const mapToken = 'sk.eyJ1IjoianN0cmVldHBob3RvIiwiYSI6ImNrNDBua2txcjAzbTkzb210ZTNsaGgydjYifQ.C1_LjKlb9NHHNN-nNthetw';
const mapURL = 'https://api.mapbox.com/directions/v5/mapbox/walking/';
const geocodingURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

const tripAdvisorKey = '1657e754d7msh055d850080cfb12p1fd65bjsnefdf7a34fe0c';
const tripAdvisorHost = 'tripadvisor1.p.rapidapi.com';
const tripAdvisorURL = 'https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng';

function displayTacoDirections(taco) {
    $('#results').prepend(
        `<p class="taco-emoji"><img src="images/taco.png" alt="taco icon"><img src="images/taco.png" alt="taco icon"><img src="images/taco.png" alt="taco icon"></p>
        <h2>It will take ${taco.minutes} minutes to walk to a taco.</h2>
        <p class="miles">It's only ${taco.miles} miles away.</p>
        `            
    );
    $('#results').removeClass('hidden');
    $('#box1').addClass('box');
    $('#box2').addClass('box');
}

function getMiles(meters) {
    return (meters * 0.00062137).toFixed(1);
}

function getMinutes(seconds) {
    return (seconds / 60).toFixed(0);
}

function handleMapResponse(responseJson) {
    const tacoDirections = {
        miles: getMiles(responseJson.routes[0].distance),
        minutes: getMinutes(responseJson.routes[0].duration)
    }
    return tacoDirections;
}

function formatMapURL(long, lat, restaurant) {
    const queryString = `${long},${lat};${restaurant.long},${restaurant.lat}`;
    const url = `${mapURL}${encodeURIComponent(queryString)}.json?access_token=${mapToken}`;
    return url;
}

function displayRestaurant(restaurant) {
    $('#results').append(
        `<h3>${restaurant.name}</h3>
        <p class="taco-address">${restaurant.address}</p>
        `            
    );
}

function handleRestaurantResponse(responseJson) {
    // clears old results and any previous error messages
    $('#results').empty();
    $('#js-error-message').empty();

    const restaurant = {
        name: responseJson.data[0].name,
        address: responseJson.data[0].address,
        lat: responseJson.data[0].latitude,
        long: responseJson.data[0].longitude
    }
    return restaurant;
}

function formatRestaurantParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

function createRestaurantsParams() {    
    const options = {
        method: 'GET',
        headers: new Headers({
            'x-rapidapi-host': tripAdvisorHost,
            'x-rapidapi-key': tripAdvisorKey})
    };
    return options;
}

function createRestaurantURL(lat, long) {
    const params = {
        latitude: lat,
        longitude: long,
        lunit: 'mi',
        combined_food: '5110'   // Ensures we are only receiving results for mexican restaurants
    };

    const queryString = formatRestaurantParams(params);
    const url = tripAdvisorURL + "?" + queryString;
    return url;
}

function getAllTheData(address) {
    const gURL = createGeocodeURL(address, geocodingURL, mapToken);
    // Graps the lat and long from the geocoding API
    sendAPIRequest(gURL)
        .then(geoJson => {
            const long = geoJson.features[0].geometry.coordinates[0];
            const lat = geoJson.features[0].geometry.coordinates[1];
            const rURL = createRestaurantURL(lat, long);
            const rOptions = createRestaurantsParams();

            // grabs the closest restaurant from trip advisers API
            sendAPIRequest(rURL, rOptions)
                .then(restaurantJson => {
                    const restaurant = handleRestaurantResponse(restaurantJson);
                    displayRestaurant(restaurant);
                    return formatMapURL(long, lat, restaurant);
                })
                .then(sendAPIRequest)
                .then(handleMapResponse)
                .then(displayTacoDirections)
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function sendAPIRequest(url, options) {
    return fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
                throw new Error(response.statusText);
        });
}

function createGeocodeURL(addr, geoURL, token) {
    const reformatAddr = encodeURIComponent(addr);
    const url = geoURL + reformatAddr + '.json?access_token=' + token; 
    return url;
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const address = $('#adr').val() + ' ' + $('#city').val() + ' ' + $('#state').val() + ' ' + $('#zip').val();
        getAllTheData(address);
    });
}

$(watchForm);