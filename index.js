var express = require('express');
var app = express();

var msg = ""

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World! Msg: ' + msg);
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

/*--------Routes----------*/
app.post('/update', function(req, res) {
  msg = req.body.kill;
  
  console.log("Message received: " + msg);

  res.send("Updated");
});
