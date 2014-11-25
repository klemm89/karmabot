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
//app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/karma'));
app.use(bodyParser.json());

/*------Start Server-------*/
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

/*--------Routes----------*/
app.get('/', function(request, response) {
  response.send('Hello World! Msg: ' + displayMsg);
});

app.get('/karma', function(request, response) {
  response.sendfile('karma/index.html');
});

app.post('/update', function(req, res) {
  var requestBody = req.body;
  console.log("Request Body: " + JSON.stringify(requestBody) );

  var parsedRequest = {};
  parsedRequest = parseUpdateRequest(requestBody);
  console.log("Value of parsedRequest: " + JSON.stringify(parsedRequest));
  updateKarma(parsedRequest.group, parsedRequest.name, parsedRequest.operator);

  res.send(parsedRequest);
});

/*---------Helper Functions---------*/

var getGroupNameFromRequest = function(requestBody){
	return requestBody.group.toUpperCase().trim();
};

var getMessageFromRequest = function(requestBody){
	return requestBody.message.toUpperCase().trim();
};

var parseUpdateRequest = function(requestBody){
	console.log("Parsing Request Body: " + JSON.stringify(requestBody) );

	var msg = getMessageFromRequest(requestBody);
	var group = getGroupNameFromRequest(requestBody);

	var name = parseMessage(msg).name;
	var operator = parseMessage(msg).operator;
		
  	if(!(name.length > 0)){
  		name = null;
  	}

  	console.log("Parsed Request");	
	console.log("Group: " + group + " Name: " + name + " Operator: " + operator);

  	var returnObject = {"name": name, "operator": operator, "group": group};

  	console.log("Parsed Request: " + JSON.stringify(returnObject));

  	return returnObject;
};

var parseMessage = function(str) {
	var regExp = /([A-z\s+]*\s)([A-z]+)([\+\+]*[\-\-]*)/g;
	//str = "Avishek avi++";
	var match = regExp.exec(str);

	if(!match){
		console.log("Regex does not match");
		return {"name": "", "operator": ""};
	} else {
		console.log("Regex result: " + match);
		console.log("Returning name: " + match[2]);
		console.log("Returning operator: " + match[3]);

		var parsedMessage = {"name": match[2], "operator": match[3]};
		return parsedMessage;
	}
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
	groupRef.child(groupName).set({"users":{}});
	console.log("Created Group: " + groupName);
};

var createUser = function(groupName, userName){
	var groupNameRef = getGroupNameRef(groupName);	
	groupNameRef.child("users").child(userName).set({"name": userName, "karma": 0});

	console.log("Created User: " + userName);
	return groupNameRef.child("users").child(userName);
};

var updateKarma = function(group, name, operator){
	if(!name || 
		(operator.indexOf(plusOperator) === -1) &&
		(operator.indexOf(minusOperator) === -1)){
		
		console.log("No command found");
		return;
	}

	//initialize user if they don't exist
	var userNameRef = getUserNameRef(group, name);

	var newKarma = 0;
	userNameRef.once('value', function(snapshot){

		newKarma = snapshot.child("karma").val();
		if(operator.indexOf(plusOperator) > -1)
		{
			newKarma = newKarma + 1;
			console.log("Plus operator detected");

		} else if(operator.indexOf(minusOperator) > -1) {

			newKarma = newKarma - 1;
			console.log("Minus operator detected");
		}

		userNameRef.update({"karma": newKarma});
		console.log("Updated Karma: " + newKarma);
	});
};
