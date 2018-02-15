Parse.Cloud.define("geolocationCoupon", function(request, response) {
var googleMapsClient = require('@google/maps').createClient({
          key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
        });



googleMapsClient.places({
language: 'en',
location: [-33.8670522,151.1957362],
radius: 500,
type: 'restaurant'
}, function(err, response) {
  if (!err) {
    console.log(response.json.results);
     return response.json;
  }
});

});
