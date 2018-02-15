var Parse = require('parse/node');

Parse.initialize("appKey231195","iAmGod231195");
Parse.serverURL = "http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse";

var Category = Parse.Object.extend("Category");
var cat = new Category();

cat.set("category", "travel");
cat.set("tag", "ola");

cat.save({ useMasterKey: true }).then(function (result) {
	console.log(result);
}, function(error){
	console.log(error);
})


