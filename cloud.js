var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});
var geocluster = require("geocluster");

const luhn = require('luhn-generator');
var apiai = require('apiai');
var app = apiai("90e3ad01fc0d445fa36216e30da0af0d");

var topResults = 5;


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


 Parse.Cloud.define("geo", function(request, response) {
	userlat=request.params.lat
	userlong=request.params.long
	Parse.User.enableUnsafeCurrentUser()
	var toky = request.params.sessionToken;
	Parse.User.become(toky).then(function (user) {
	var point = new Parse.GeoPoint({latitude: Number(userlat), longitude: Number(userlong)});
	var UserCluster = Parse.Object.extend("UserCluster");
	var userCluster = new Parse.Query(UserCluster);
	userCluster.equalTo("userPointer",user)
	userCluster.find(null, { useMasterKey: true }).then(function(result){
		console.log('found user for cluster')
		var centroids = JSON.parse(result[0].get("test"));
		var nearestPoint
		var minDistance = 1000000000
		console.log('centroids are '+centroids)
		for(var i in centroids){
			centroid = centroids[i];
			var pointi = centroid['centroid']
			console.log('centroid '+pointi[0]+ ' ' +pointi[1]);
			var geoPoint = new Parse.GeoPoint({latitude: Number(pointi[0]), longitude: Number(pointi[1])});
			var distance = geoPoint.kilometersTo(point)
			console.log('distance'+distance);
			if(distance < minDistance){
				minDistance = distance
				nearestPoint = geoPoint
			}

		}
		// Find Minimum dist centroid
//		console.log('near'+JSON.stringify(nearestPoint))
		response.success('success');

		// Read Db to get daily sub category trend
		var PredictData = Parse.Object.extend("Month_predct")
		var predictData = new Parse.Query(PredictData)
		var currentTime = new Date();
		var day = currentTime.getDate();
                        console.log('day'+day)
		day="Day"+day;
		console.log("User"+user.id)
		predictData.equalTo("Acnt_id",user.id)
		predictData.find({ useMasterKey: true }).then(function(result){
			console.log('inside que');
			var categories = result[0].get(day); // returns comma seperated subcategories
			console.log('res '+result[0].get(day))
			var categoryArr = categories.split(",")
			console.log(categoryArr)
			for(var i = 0 ; i < categoryArr.length ; i++){
			console.log(categoryArr[i])
			console.log(nearestPoint.latitude)
			console.log(nearestPoint.longitude)
			googleMapsClient.places({
				query: categoryArr[i],
				language: 'en',
				location: [nearestPoint.latitude, nearestPoint.longitude],
			}, function(err, response) {
			  if (!err) {
			    console.log(response.json.results[0]['name']);
				trendName = response.json.results[0]['name'];
			    var QuateryTrend = Parse.Object.extend("Day_pdt")
				var quateryTrend = new Parse.Query(QuateryTrend)
				quateryTrend.equalTo("Account_id",user.id)
				var crtTime = new Date().getHours();
				crtTime = Math.ceil(crtTime/6) + 1
				console.log("current time "+crtTime)
				quateryTrend.find({ useMasterKey: true }).then(function(quaterResult){
					var trendvalid = quaterResult[0].get("Day_"+crtTime.toString()+"qur_items")
					console.log(trendName+ ': '+trendvalid)
					trends = trendvalid.split(',');
					var isThere=false;
					for(var k in trends){
						console.log('trds: '+trends[k])
						if(trendName==trends[k]){
							isThere = true;
						}
					}
					if(isThere){
						console.log('im here')
						var PusNotification = Parse.Object.extend("PushNotification")
						var pNotification = new Parse.Query(PusNotification);
						console.log('usr'+user.id);
						pNotification.equalTo("userPointer",user)
						pNotification.find({useMasterKey: true}).then(function(notificationResult){
							console.log(notificationResult.length)
							if(notificationResult.length == 0 ){
								console.log("Push init");
								var pushQuery = new Parse.Query(Parse.Installation);
								pushQuery.equalTo("user", request.user);
								Parse.Push.send({
									where: pushQuery,
									data: { title: "digiBank",
											sound: "default",
											alert: trendName + "50% Off : SF34ZX ",
											badge: "Increment"
										}
									}, { useMasterKey: true })
									.then(function() {
										console.log("Push sent to : "+user.id);
										response.success("Success");
									}, function(error) {
										console.log ("Push request error : " + error.code + " : " + error.message + " Device ID : "+deviceToken);
										response.error(error);
									});
							}else{
								response.success('Coupon already sent')
							}
						})

					}
				});
			  }
			});
			}
		});
		// foreach subcategory call googlemaps api to find nearest point of interest 
		
		
		//check quaterly trent to decide push notification
		//check if notification has already been sent and send notification and break out


	}, function (error) {
		console.log(error);
		});
	});

});

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


function getLocations(user) {
	var userLocArr = [];
	var UserLocation = Parse.Object.extend("UserLocation");
	var locationQuery = new Parse.Query(UserLocation);
	locationQuery.equalTo("userPointer", user);
	locationQuery.find({ useMasterKey:true }).then(function(userLocations) {

	console.log("UserLocations found : "+userLocations.length);
	console.log("User : "+user.id);
	if(userLocations.length){
		for(var x in userLocations) {
			console.log('x is'+x);
			var userLocation = userLocations[x];
			console.log("UserLocation")
			var userLat = userLocation.get("lat");
			console.log(userLat)
			var userLong = userLocation.get("long");
			console.log(userLong)
			var locArr = [Number(userLat),Number(userLong)];
			console.log(locArr)
			userLocArr.push(locArr);
		}
		console.log(userLocArr)
		console.log("Exited for loop")
		var bias = 1.5
	    var cluster = geocluster(userLocArr, bias);
	    console.log(cluster)
	    
	    // console.log(cluster);

	    var UserCluster = Parse.Object.extend("UserCluster");
	    var userCluster = new UserCluster();
	    userCluster.set({"test":JSON.stringify(cluster)});
		userCluster.set("userPointer",user);
		userCluster.save(null, { useMasterKey: true }).then(function(result){
	    		console.log("Success");
		    	response.success(function(){
	    			console.log('success');
	    			return 1;
			    }, function(error) {
	    			return 0;
			});
		return 1;
		});
		return 1;
	}
	else{
		console.log("No location data found")
		return 0;
	}
})}

Parse.Cloud.define("updateCluster", function(request, response) {
	var userQuery = new Parse.Query(Parse.User);
	userQuery.find({ useMasterKey:true }).then(function(users){
		console.log("Users found : "+users.length);
		for(var i in users) {
				let promises = [];
				var user = users[i];
				promises.push( new Promise(function(resolve,reject){
					op=getLocations(user);
					console.log(op);
					if(op){
						resolve(op);
					}else {
						reject(op);
					}
				}));
			}
		return Promise.all(promises);
	}, function(error){
		console.log("Users find error : "+error);
	});
	response.success('success');
});


Parse.Cloud.define("geoFix",function(request,response){
	var UserLocation= Parse.Object.extend("UserLocation");
        var userlocation = new UserLocation();

        var query = new Parse.Query(userlocation);
        query.find({
                success: function(results) {
                        console.log('Query done, fetched all rows');
                        for (var i = 0; i < results.length; i++) {
                                var obj = results[i];
                                var lat = obj.get("lat");
                                var long = obj.get("long");
				var point = new Parse.GeoPoint({latitude: Number(lat), longitude: Number(long)});
                                console.log('lat and long '+lat+' '+long+' and point '+point);
				obj.set("latlong",point);
				obj.save(null, { useMasterKey: true }).then(function(resu){
                                                        console.log('success');
                                                });

/*				var query2 = new Parse.Query(userlocation);
				console.log('objectid '+obj.id);
				query2.equalTo("objectId",obj.id);
				query2.find({
					success: function(res) {
						console.log('res : '+res);
						res.set("latlong",point);
						res.save(null, { useMasterKey: true }).then(function(resu){
							console.log('success');
						});
					},error: function(err) {
					}
				})
*/
                        }
                },error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		}
        });
	response.success('success');

});
