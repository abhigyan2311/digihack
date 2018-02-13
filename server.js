var fs = require('fs');
var https = require('https');
var express = require('express');
var ParseDashboard = require('parse-dashboard');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;

var app = express();

// Parse Server Options
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017',
  cloud: './cloud/main.js',
  appId: 'appKey231195',
  masterKey: 'iAmGod231195',
  serverURL: 'http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com/parse',
  allowClientClassCreation: true,
  enableAnonymousUsers: false,
  filesAdapter: new S3Adapter(
    "AKIAICQVAIZ6RFLLGYEQ",
    "unxopFpgrVIIYIV33siXYfwKXsZvV8WNLuFp1Sfz",
    "digihack",
    {
      directAccess: false,
      region: 'ap-south-1'
    }
  ),
//   push: {
//       android: {
//         senderId: '',
//         apiKey: ''
//       },
//       ios: {
//         pfx: '',
//         topic: '',
//         production: true
//       }
//     },
});

//Parse Dashboard Options
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://ec2-13-127-176-156.ap-south-1.compute.amazonaws.com/parse",
      "appId": "appKey231195",
      "masterKey": "iAmGod231195",
      "appName": "DigiHack",
    //   "iconName": "fas.png",
      "production": true
    }
  ],
  "iconsFolder": "icons",
  "users": [
    {
      "user":"digiadmin",
      "pass":"iAmGod231195"
    }
  ]
});


// Serve the Parse API on the /parse URL
app.use('/parse', api);

//Server Parse Dashboard on the /dashboard URL
app.use('/dashboard', dashboard);

app.use('/static', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
  res.sendFile('index.html' , { root : __dirname});
});

var httpsServer = https.createServer(options, app).listen(443, function() {
  console.log('Digihack server started...');
});
