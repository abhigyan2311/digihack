var fs = require('fs');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;

var app = express();

// Parse Server Options
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017',
  cloud: './cloud.js',
  appId: 'appKey231195',
//  clientKey: 'clientKey231195',
  masterKey: 'iAmGod231195',
  serverURL: 'http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com:1337/parse',
  allowClientClassCreation: true,
//  restAPIKey: 'restApi123',
  enableAnonymousUsers: false,
  filesAdapter: new S3Adapter(
    "digihack",
    {
      directAccess: false,
      region: 'ap-south-1'
    }
  ),
  push: {
      ios: {
        pfx: './digiBankCerts.p12',
        passphrase: '123123123',
        bundleId: 'com.dbs.digiBank',
        production: true
      }
  }
});


// Serve the Parse API on the /parse URL
app.use('/parse', api);

app.use('/static', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
  res.sendFile('index.html' , { root : __dirname});
});

app.listen(1337, function() {
    console.log('DigiHack Server started on port : 1337');
  });
