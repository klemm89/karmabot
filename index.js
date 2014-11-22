/*----Require Config----*/
var express = require('express');
var app = express();

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://resplendent-torch-4535.firebaseio.com/");
var usersRef = myFirebaseRef.child("users");

var bodyParser = require('body-parser');


/*---Global Variables---*/
var names = {};
var displayMsg = null;
var plusDelimiter = "++";

/*----Configure Express------*/
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

/*------Start Server-------*/
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

/*--------Routes----------*/
app.get('/', function(request, response) {
  response.send('Hello World! Msg: ' + displayMsg);
});

app.post('/update', function(req, res) {
  var str = req.body.message;
  var delimiter = "++"
  var name = getName(str,plusDelimiter);
  addKarma(name);

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
	var nameRef = usersRef.child(name);
	if(nameRef){
		var updatedKarma = nameRef.child("karma").val() + 1;
		console.log("Updated Karma: " + updatedKarma);
		nameRef.update({"karma": updatedKarma});
	} else {
		usersRef.push(name);
		nameRef = usersRef.child(name);
		nameRef.update({
			"karma": 1
		});
	}

};
