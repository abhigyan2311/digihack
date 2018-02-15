var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});

Parse.Cloud.define("geo", function(request, response) {
	response.success("Hello world!");
	googleMapsClient.places({
		language: 'en',
location: [-33.865, 151.038],
radius: 500,
type: 'restaurant'
	},function(err, response) {
	  if (!err) {
	    console.log(response.json.results);
  	  }
});
