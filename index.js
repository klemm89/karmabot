var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var msg = "";
var karma = 1;

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



app.get('/', function(request, response) {
  response.send('Hello World! Msg: ' + msg + '|' + karma);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

/*--------Routes----------*/
app.post('/update', function(req, res) {
  var str = req.body.message;
  var delimiter = "++"
  var name = str.split(delimiter)[0];

  msg = name;
  karma = karma + 1;


  
  console.log("Message received: " + msg);

  res.send("Updated");
});
