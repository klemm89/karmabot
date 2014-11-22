/*----Require Config----*/
var express = require('express');
var app = express();

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://resplendent-torch-4535.firebaseio.com/");

var bodyParser = require('body-parser');


/*---Global Variables---*/
var names = {};
var plusDelimiter = "++";

/*----Configure Express------*/
/*app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
  app.use(express.json());       // to support JSON-encoded bodies
  app.use(express.urlencoded()); // to support URL-encoded bodies
});*/
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
//app.use(app.router);
//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies





app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

/*--------Routes----------*/
app.get('/', function(request, response) {
  response.send('Hello World! Msg: ' + names);
});

app.post('/update', function(req, res) {
  var str = req.body.message;
  var delimiter = "++"
  var name = getName(str,plusDelimiter);
  addKarma(name);


  
  console.log("Message received: " + msg);

  res.send("Updated");
});

/*---------Helper Functions---------*/

var getName = function(msg, delimiter){
	var str = msg.toUpperCase(),
		name = str.split(delimiter)[0];

  	if(name.length > 0){
  		return name;
  	} else {
  		return null;
  	}
};

var addKarma = function(name){
	if(names[name]){
		names[name] = names[name] + 1;
	} else {
		names[name] = 1;
	}

	myFirebaseRef.push(names);
};
