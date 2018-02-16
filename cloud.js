var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDSVzX5h_PsWX6llQXnNLvGQv5yHAgdNbQ'
});

const luhn = require('luhn-generator');
var apiai = require('apiai');
var app = apiai("90e3ad01fc0d445fa36216e30da0af0d");

var topResults = 5;

Parse.Cloud.define("callBot",function(req,resp) {
	var request = app.textRequest('add new payee', {
   		sessionId: 'someuniqueid'
	});
	request.on('response', function(response) {
	    console.log(response);
	    save = response;
	});

	request.on('error', function(error) {
	    console.log(error);
	});

	request.end();
	resp.success(save);

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


