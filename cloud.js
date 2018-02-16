var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});


var topResults = 5;

Parse.Cloud.define("geo", function(request, response) {
	googleMapsClient.places({
		location: [request.params.lat, request.params.long],
		radius: 5,
		type: 'restaurant'
		},function(err, resp) {
	  		if (!err) {
	    			response.success(resp.json.results[0]);
  	  		} else {
				response.error(err);
}
	});
});
