var Parse = require('parse/node');
var fs = require('fs');

Parse.initialize("appKey231195");
Parse.serverURL = "http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse";






Parse.User.logIn("abhigyan2311", "123", {
  success: function(user) {
    console.log(user);
    Parse.Cloud.run("geo",{sessionToken: user.getSessionToken(), lat:'17.44',long:'78.34'}).then(function(res){
        	console.log(res);
	}, function(error){
	        console.log(error);
	});


  },
  error: function(user, error) {
    // The login failed. Check error to see why.
  }
});









/*
Parse.Cloud.run("pushNotification").then(function(res){
	console.log(res);
}, function(error){
	console.log(error);
});



*/


