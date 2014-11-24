/*----Require Config----*/
var express = require('express');
var app = express();

var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://resplendent-torch-4535.firebaseio.com/");

var bodyParser = require('body-parser');


/*---Global Variables---*/
var names = {};
var displayMsg = null;
var plusOperator = "++";
var minusOperator = "--";
var groupRef = myFirebaseRef.child("groups");

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
  console.log("Request Body: " + JSON.stringify(requestBody) );

  var parsedRequest = parseUpdateRequest(requestBody);
  //updateKarma(parsedRequest.group, parsedRequest.name, parsedRequest.operator);

  res.send("Updated");
});

/*---------Helper Functions---------*/

var getGroupNameFromRequest = function(requestBody){
	return requestBody.group.toUpperCase();
};

var getMessageFromRequest = function(requestBody){
	return requestBody.message.toUpperCase();
};

var parseUpdateRequest = function(requestBody){
	console.log("Parsing Request Body: " + JSON.stringify(requestBody) );

	var msg = getMessageFromRequest(requestBody);
	var group = getGroupNameFromRequest(requestBody);

	var name = parseMessage(msg).name;
	var operator = parseMessage(msg).operator;
		



  	if(!(name.length > 0)){
  		name = null;
  	} else {
  		return null;
  	}

  	console.log("Parsed Request");	
	console.log("Group: " + group + " Name: " + name + " Operator: " + operator);

  	var parsedRequest = {"name": name, "operator": operator, "group": group};

  	console.log("Parsed Request: " + JSON.stringify(parsedRequest));

  	return parsedRequest;
};

var parseMessage = function(str) {
	var regExp = /([A-z\s+]*\s)([A-z]+)(\+\+)/g;
	var test = "Avishek avi++";
	var match = regExp.exec(test);

	console.log("Regex result: " + match);
	console.log("Returning name: " + match[2]);
	console.log("Returning operator: " + match[3]);

	var parsedMessage = {"name": match[2], "operator": match[3]};
	return parsedMessage;
};

var getGroupNameRef = function(groupName){
	groupRef.once('value', function(snapshot){
		if(snapshot.child(groupName).val() === null) {
			/*---Group does not exist yet---*/
			console.log("Group " + groupName + " does not exist");
			createGroup(groupName);
		}
	});
	return groupRef.child(groupName);
};

var getUserNameRef = function(groupName, userName){
	groupRef.once('value', function(snapshot){
		if(snapshot.child(groupName).child("users").child(userName).val() === null) {
			/*---User does not exist yet---*/
			console.log("User " + userName + " does not exist");
			createUser(groupName, userName);
		}
	});
	return groupRef.child(groupName).child("users").child(userName);
};

var createGroup = function(groupName){
	groupRef.push(groupName);
	console.log("Created Group: " + groupName);

	groupRef.child(groupName).push("users");
};

var createUser = function(groupName, userName){
	var groupNameRef = getGroupNameRef(groupName);
	groupNameRef.child("users").push(userName);
	console.log("Created User: " + userName);
	groupNameRef.child("users").child(userName).update({"karma": 1});
	return groupNameRef.child("users").child(userName);
};

var updateKarma = function(group, name, operator){
	if(!name){
		console.log("No karma to add");
		return;
	}

	//initialize group if doesn't exist
	var groupNameRef = getGroupNameRef(group);

	//initialize user if they don't exist
	var userNameRef = getUserNameRef(group, name);

	var newKarma = null;
	userNameRef.once('value', function(snapshot){

		newKarma = snapshot.child("karma").val();
		if(operator.indexOf(plusOperator) > -1)
		{
			newKarma = newKarma + 1;

		} else if(operator.indexOf(minusOperator) > -1) {

			newKarma = newKarma - 1;
		}

		userNameRef.update({"karma": newKarma});
		console.log("Updated Karma: " + newKarma);
	});
};
