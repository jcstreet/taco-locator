'use strict'

const mapToken = 'sk.eyJ1IjoianN0cmVldHBob3RvIiwiYSI6ImNrNDBua2txcjAzbTkzb210ZTNsaGgydjYifQ.C1_LjKlb9NHHNN-nNthetw';

const tripAdvisorKey = '1657e754d7msh055d850080cfb12p1fd65bjsnefdf7a34fe0c';
const tripAdvisorHost = 'tripadvisor1.p.rapidapi.com';
const tripAdvisorURL = 'https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng';


function displayResults(responseJson) {
    console.log(responseJson);
    
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

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

function getRestaurants(lat, long) {
    const params = {
        latitude: lat,
        longitude: long,
        lunit: 'mi',
        combined_food: '5110'   // Ensures we are only receiving results for mexican restaurants
    };

    const queryString = formatQueryParams(params);
    const url = tripAdvisorURL + '?' + queryString;
    
    const options = {
        method: 'GET',
        headers: new Headers({
            'x-rapidapi-host': tripAdvisorHost,
            'x-rapidapi-key': tripAdvisorKey})
    };

    console.log(url);
    console.log(options);
    sendAPIRequest(url, options);
}

function sendAPIRequest(url, options) {
    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
            throw new Error(response.statusText);
        })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();

        let query = 'taco';
        let lat = '40.712776';
        let long = '-74.005974';

        getRestaurants(lat, long);
    });
}

$(watchForm);