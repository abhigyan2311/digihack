var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});

const luhn = require('luhn-generator');
var apiai = require('apiai');
var app = apiai("90e3ad01fc0d445fa36216e30da0af0d");

var topResults = 5;


Parse.Cloud.define("pushNotification", function(req, resp) {
//	var userQuery = new Parse.Query(Parse.User);
	var pushQuery = new Parse.Query(Parse.Installation);
	pushQuery.where("user", req.user);
	Parse.Push.send({
	  where: pushQuery,
	  data: {
	    alert: "Free hotdogs at the Parse concession stand!"
	  }
	}, {
	  success: function() {
		console.log('success');
	    // Push was successful
	  },
	  error: function(error) {
	    // Handle error
		console.log(error);
	  }
	});
});


Parse.Cloud.define("callBot", function(req,resp) {
	var request = app.textRequest(req.params.digorQuery, {
   		sessionId: req.user.getSessionToken()
	});
	request.on('response', function(response) {
	    resp.success(response);
	});

	request.on('error', function(error) {
	    console.log(error);
	});

	request.end();

});

Parse.Cloud.afterSave(Parse.User,function(req){
	var Account = Parse.Object.extend("Account");
	var account = new Account();
	account.set("user", req.object);
	var phone=req.object.get("phone");
	account.set("upi",phone+"@upi");
	account.set("balance",0);
	account.set("type","savings");
	do{
		var cardNumber=luhn.random(16);
		luhnFlag = luhnAlgo(cardNumber);
	}while(!luhnFlag);

	account.set("accountNo",luhn.random(10))
	account.set("debitCardNumber",cardNumber);

	account.save(null, { useMasterKey: true }).then(function(result){
	}, function(error){
		console.log(error);
	})
});

function luhnAlgo(sixteenDigitString) {
// Validate using luhn
	var numSum = 0;
        var value;
        for (var i = 0; i < 16; ++i) {
            if (i % 2 == 0) {
                value = 2 * sixteenDigitString[i];
                if (value >= 10) {
                    value = (Math.floor(value / 10) + value % 10);
                }
            } else {
                value = +sixteenDigitString[i];
            }
            numSum += value;
        }
        return (numSum % 10 == 0);
}


// Parse.Cloud.define("geo", function(request, response) {
// 	googleMapsClient.places({
// 		location: [request.params.lat, request.params.long],
// 		radius: 5,
// 		type: 'restaurant'
// 		},function(err, resp) {
// 	  		if (!err) {
// 	    			response.success(resp.json.results[0]);
//   	  		} else {
// 				response.error(err);
// }
// 	});
// });

Parse.Cloud.define("updateLocation", function(request, response) {
	var UserLocation = Parse.Object.extend("UserLocation");
	Parse.User.enableUnsafeCurrentUser()
//	var currentUser = Parse.User.current();
//	var sessionToken = request.user.sessionToken;
	var toky = request.params.sessionToken;
	Parse.User.become(toky).then(function (user) {
	console.log(user);
		var userLocation = new UserLocation();
                userLocation.set("lat", request.params.lat);
                userLocation.set("long", request.params.long);
                userLocation.set( "userPointer",user);
                userLocation.save(null, { useMasterKey: true }).then(function(result){
                        console.log("Success");
                        response.success("success");
                }, function(error){
                        console.log(error);
                })
	response.success(user);
	}, function (error) {
		console.log(error);
	});
});

Parse.Cloud.define("updateCluster", function(request, response) {
	var geocluster = require("geocluster");

	var UserTable = Parse.Object.extend("User");


	var query = new Parse.Query(UserTable);
	var users = []

	query.find({
		success: function(results) {
			console.log(results);
			console.log("Successfully retrieved " + results.length + " users.");
			for (var i = 0; i < results.length; i++) {
				var objectId = results[i].id
				users.push(objectId)
			}
			console.log(users)
			 var UserLocation = Parse.Object.extend("UserLocation");
		        console.log('users:'+users.length);
		        for(var i=0;i<users.length;++i){
	                user=users[i];
        	        console.log(user);
                	var query = new Parse.Query(UserLocation);
	                query.equalTo("userPointer", { "__type": "Pointer", "className": "_User", "objectId": user });
        	        var userLocations = []
                	query.find({
		                success: function(results) {
		                console.log("Successfully retrieved " + results.length + " location.");
		                    location = []
                		for (var i = 0; i < results.length; i++) {
                                	location.push(results[i]["lat"])
	                                location.push(results[i]["long"])
        	                }
                	        userLocations.push(location)
				 // create cluster
                		var bias = 1.5
		                var result = geocluster(userLocations, bias); 
		                var UserCluster = Parse.Object.extend("UserCluster");
                		var query2 = new Parse.Query(UserCluster)
		                Parse.User.currentAsync().then(function(currentUser) {
                        	console.log(currentUser);
                	        var userCluster = new UserCluster();
        	                console.log(user);
	                        userCluster.save(result);
                        	userCluster.save("userPointer",{__type:'Pointer', className:'User', objectId: user})
			            userCluster.save(null, { useMasterKey: true }).then(function(result){
        	                console.log("Success");
	                        response.success("success");
                	        },function (error) {
        	                        console.log(error);
	                        });
                		});
	                },
        	        error: function(error) {
                	        console.log("Error: " + error.code + " " + error.message);
	                }
        	        });
		//
		},
			error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		}
	});

});





