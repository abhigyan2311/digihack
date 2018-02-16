var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});


var apiai = require('apiai');

var app = apiai("90e3ad01fc0d445fa36216e30da0af0d");

var request = app.textRequest('Hello', {
    sessionId: 'someuniqueid'
});

var save ;
request.on('response', function(response) {
    console.log(response);
    save = response;
});

request.on('error', function(error) {
    console.log(error);
});

request.end();

var topResults = 5;

Parse.Cloud.afterSave("User",function(request){
});


Parse.Cloud.define("geo", function(request, response) {
	googleMapsClient.places({
		location: [request.params.lat, request.params.long],
		radius: 5,
		type: 'restaurant'
		},function(err, resp) {
	  		if (!err) {
	    			response.success(save);
  	  		} else {
				response.error(err);
}
	});
});


