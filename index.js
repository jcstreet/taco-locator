'use strict'

const mapToken = 'sk.eyJ1IjoianN0cmVldHBob3RvIiwiYSI6ImNrNDBua2txcjAzbTkzb210ZTNsaGgydjYifQ.C1_LjKlb9NHHNN-nNthetw';
const mapURL = 'https://api.mapbox.com/directions/v5/mapbox/walking/';
const geocodingURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

const tripAdvisorKey = '1657e754d7msh055d850080cfb12p1fd65bjsnefdf7a34fe0c';
const tripAdvisorHost = 'tripadvisor1.p.rapidapi.com';
const tripAdvisorURL = 'https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng';

let gUrl = '';
let options = {};
let restUrl = '';

function displayResults(responseJson) {
    // clear old results out and previous error messages
    //$('#results-list').empty();
    //$('#js-error-message').empty();

    //console.log(responseJson.data[0].fullName);

    //for (let i = 0; i < responseJson.data.length; i++) {
       // $('#results-list').append(
            //`<li><h3>${responseJson.data[i].fullName}</h3>
            //<p>${responseJson.data[i].description}</p>
            //<a href=${responseJson.data[i].url} target="blank">${responseJson.data[i].url}</a>
            //</li>`            
    //)};
    //$('#results').removeClass('hidden')
}

// function formatMapParams(params) {
//     const queryItems = Object.keys(params)
//         .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
//     return queryItems.join('&');
// }

// function getMapData() {
//     const mapURLTest = 'https://api.mapbox.com/directions/v5/mapbox/walking/-73.989%2C40.733%3B-74%2C40.733.json?access_token=pk.eyJ1IjoianN0cmVldHBob3RvIiwiYSI6ImNrNDBuaGc1ODAza2UzbG1zeTN4YmR6aTYifQ.jwuhK79huZWKto7UTfZvQQ';
//     sendAPIRequest(mapURLTest);
// }

function formatRestData(responseJson) {
    $('#results-list').empty();
    $('#js-error-message').empty();

    const restaurant = responseJson.data[0].name;
    const restAddress = responseJson.data[0].address;
    const restLat = responseJson.data[0].latitude;
    const restLong = responseJson.data[0].longitude;

    $('#results-list').append(
        `<li><h3>${restaurant}</h3>
            <p>${restAddress}</p>
            <p>${restLat}</p>
            <p>${restLong}</p>
        </li>`            
    );
    $('#results').removeClass('hidden');
}

function formatRestaruantParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

function createRestaurantsParams(lat, long) {
    const params = {
        latitude: lat,
        longitude: long,
        lunit: 'mi',
        combined_food: '5110'   // Ensures we are only receiving results for mexican restaurants
    };

    const queryString = formatRestaruantParams(params);
    restUrl = tripAdvisorURL + '?' + queryString;
    
    options = {
        method: 'GET',
        headers: new Headers({
            'x-rapidapi-host': tripAdvisorHost,
            'x-rapidapi-key': tripAdvisorKey})
    };
}

function createGeocodeURL(addr, geoURL, token) {
    const reformatAddr = encodeURIComponent(addr);
    gUrl = geoURL + reformatAddr + '.json?access_token=' + token; 
}

function getGeocode() {
    // Graps the lat and long from the geocoding API
    sendAPIRequest(gUrl)
    .then(responseJson => {
        const long = responseJson.features[0].geometry.coordinates[0];
        const lat = responseJson.features[0].geometry.coordinates[1];

        createRestaurantsParams(lat, long);
        // grabs the closes restaurant from trip advisers API
        sendAPIRequest(restUrl, options)
        .then(responseJson => {
            console.log(responseJson);
            formatRestData(responseJson);
        })
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

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const address = $('#adr').val() + ' ' + $('#city').val() + ' ' + $('#state').val() + ' ' + $('#zip').val();
        createGeocodeURL(address, geocodingURL, mapToken);
        getGeocode();
    });
}

$(watchForm);