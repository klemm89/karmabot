/*----Require Config----*/
var express = require('express');
var app = express();

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://resplendent-torch-4535.firebaseio.com/");
var groupRef = myFirebaseRef.child("groups");
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
  var requestBody = req.body;
  var delimiter = "++"
  var name = getUserNameFromRequest(requestBody,plusDelimiter);
  var group = getGroupNameFromRequest(requestBody);
  addKarma(group, name);

  res.send("Updated");
});

/*---------Helper Functions---------*/

var getGroupNameFromRequest = function(requestBody){
	return requestBody.group.toUpperCase();
};

var getUserNameFromRequest = function(requestBody, delimiter){
	var str = requestBody.message.toUpperCase(),
		name = str.split(delimiter)[0];

  	if(name.length > 0){
  		return name;
  	} else {
  		return null;
  	}
};

var getGroupNameRef = function(groupName){
	groupRef.once('value', function(snapshot){
		if(snapshot.child(groupName).val() === null) {
			/*---Group does not exist yet---*/
			createGroup(groupName);
		}
	});
	return groupRef.child(groupName);
};

var getUserNameRef = function(groupName, userName){
	return groupRef.child(groupName).child("users").child(userName);
};

var createGroup = function(groupName){
	groupRef.push(groupName);
	groupRef.child(groupName).push("users");
};

var createUser = function(groupName, userName){
	var groupNameRef = getGroupNameRef(groupName);
	groupNameRef.child("users").push(userName);
	return groupNameRef.child("users").child(userName);
};

var userExists = function(groupName, userName) {

	var usersRef = getGroupNameRef(groupName).child("users");
	var userExists = undefined;

	usersRef.once('value', function(snapshot) {
		if (snapshot.child(userName).val() === null) {
	       /* There is no user */
	  		userExists = false;
			console.log("User doesn't exist");
	   	} else {
	       	/* User exists.*/
	       	userExists = true;
	      	console.log("User exists");
	   }
	});

	return userExists;
};

var addKarma = function(group, name){
	//initialize group if doesn't exist
	var groupNameRef = getGroupNameRef(group);
	var newKarma = null;

	if(userExists(group, name)) {
		newKarma = getUserKarma(group, name) + 1;
	} else {
		createUser(group, name);
		newKarma = 1;
	}

	var userNameRef = getUserNameRef(group, name);
	userNameRef.update({"karma": newKarma});
	console.log("Updated Karma: " + newKarma);

};
