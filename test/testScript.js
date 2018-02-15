var Parse = require('parse/node');
var fs = require('fs');

Parse.initialize("appKey231195","iAmGod231195");
Parse.serverURL = "http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse";

var temp = ["abhigyan",
"suman",
"harjot",
"dharam"
];

for(var i=0;i<temp.length;i++){
	var Category = Parse.Object.extend("User");
	var cat = new Category();
	cat.set("username", temp[i]);
	cat.set("password", "12345");
	cat.set("email", temp[i]+"@lodalassan.com");
	cat.set("pan","FRPPS3131D")
	cat.set("aadhar",758194450368)
	cat.set("address","DAH2, Hyderabad")
  	cat.save({ useMasterKey: true }).then(function (result) {
		console.log(result);
	}, function(error){
		console.log(error);
	});
}
    







