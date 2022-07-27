$(document).ready(function () {

    // API from openweather
    var apiKey = '03a92e8c1969ebb1b19536fcee050164';

    var cityEl = $('#city');
    var dateEl = $('#date');
    var weatherIconEl = $('#weather-icon');
    var temperatureEl = $('#temperature');
    var humidityEl = $('#humidity');
    var windEl = $('#wind');
    var uvIndexEl = $('#uv-index');
    var cityListEl = $('div.cityList');
    var cityInput = $('#city-input');
    var arrayCities = [];


   // function toUpperCase 
   function uppercase (a, b) {
       var Acity = a.city.toUpperCase();
       var Bcity = b.city.toUpperCase();

       var upperCaseComparison = 0;
       if (Acity > Bcity) {
        upperCaseComparison = 1;
       } else if (Acity < Bcity) {
        upperCaseComparison = -1;
       }
       return upperCaseComparison;
   }

    //cities in local storage
    function storeCities() {
        localStorage.setItem('arrayCities', JSON.stringify(arrayCities));
    }

   // Functions for OpenWeather API call
 
    function URLInputs(city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function URLid(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

     // Function display last 10 cities
     function cities(arrayCities) {
        cityListEl.empty();
        arrayCities.splice(10);
        var lookCities = [...arrayCities];
        lookCities.sort(uppercase);
        lookCities.forEach(function (location) {
            var cityDiv = $('<div>').addClass('row border border-1 rounded-1 cityList');
            var cityBtn = $('<button>').addClass('btn btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }
    
     // Search for weather conditions by calling the OpenWeather API
     function searchWeather(queryURL) {

    // UV Color Function  
    function UVIcolor(uvi) {
        if (uvi < 2) {
            return 'green';
        } else if (uvi >= 2 && uvi < 5) {
            return 'yellow';
        } else if (uvi >= 6 && uvi < 9) {
            return 'light orange';
        } else if (uvi >= 9 && uvi < 11) {
            return 'red';
        } else return 'purple';
    }

        // AJAX to call weather data
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {

            // Store current city in past cities
            var city = response.name;
            var id = response.id;
            // Remove duplicate cities
            if (arrayCities[0]) {
                arrayCities = $.grep(arrayCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            arrayCities.unshift({ city, id });
            storeCities();
            cities(arrayCities);
            
            // Display current weather in DOM elements
            cityEl.text(response.name);
            var planDate = moment.unix(response.dt).format('L');
            dateEl.text(planDate);
            var weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(response.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));

            //  API with lat and lon to get the UV with 5 day forecast ( I got this information from https://openweathermap.org/api/one-call-api)
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            var queryURLAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            $.ajax({
                url: queryURLAll,
                method: 'GET'
            }).then(function (response) {
                var uv = response.current.uvi;
                var uvColor = UVIcolor(uv);
                uvIndexEl.text(response.current.uvi);
                uvIndexEl.attr('style', `background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}`);
                var fiveDay = response.daily;

                // Display 5 day weather (using OpenWeatherMap API Tutorial https://www.youtube.com/watch?v=nGVoHEZojiQ )
                for (var i = 0; i <= 5; i++) {
                    var currentDay = fiveDay[i];
                    $(`div.day-${i} .card-title`).text(moment.unix(currentDay.dt).format('L'));
                    $(`div.day-${i} .fiveDay-img`).attr(
                        'src',
                        `http://openweathermap.org/img/wn/${currentDay.weather[0].icon}.png`
                    ).attr('alt', currentDay.weather[0].description);
                    $(`div.day-${i} .fiveDay-temp`).text(((currentDay.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                    $(`div.day-${i} .fiveDay-humid`).text(currentDay.humidity);
                }
            });
        });
    }

     // Load from local storage
     function loadCities() {
        var storedCities = JSON.parse(localStorage.getItem('arrayCities'));
        if (storedCities) {
            arrayCities = storedCities;
        }
    }
 
    // Search button
    $('#search-btn').on('click', function (event) {
        event.preventDefault();

        // pull the city inputs
        var city = cityInput.val().trim();
        city = city.replace(' ', '%20');

        // Clear search bar
        cityInput.val('');

        // City query and Weather
        if (city) {
            var queryURL = URLInputs(city);
            searchWeather(queryURL);
        }
    }); 
    
    // Click handler for city buttons to load that city's weather
    $(document).on("click", "button.city-btn", function (event) {
        var clickedCity = $(this).text();
        var foundCity = $.grep(arrayCities, function (storedCity) {
            return clickedCity === storedCity.city;
        })
        var queryURL = URLid(foundCity[0].id)
        searchWeather(queryURL);
    });

});

// refrance Links : https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
// https://getbootstrap.com/
// https://openweathermap.org/
