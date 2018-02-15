var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});

Parse.Cloud.define("geo", function(request, response) {
	googleMapsClient.places({
		location: [-33.865, 151.038],
		radius: 500,
		type: 'restaurant'
		},function(err, resp) {
	  		if (!err) {
	    			response.success(resp.json);
  	  		} else {
				response.error(err);
}
	});
});
