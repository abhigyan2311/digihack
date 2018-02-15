var Parse = require('parse/node');

Parse.initialize("appKey","jsKey","masterKey");
Parse.serverURL = 'serverURL/parse';

var data = [];
data.push(["User ID","Category","Rating","Report Score","Place","Date","Time"]);
var User = Parse.User;
var q = new Parse.Query(User);
q.find({ useMasterKey:true }).then(function(users) {
    for(var i=0; i<users.length; i++) {
        //Do shit
    }
});

