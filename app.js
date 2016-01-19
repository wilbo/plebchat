var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var dateFormat = require('dateformat');

app.set('views', './views');
app.set('view engine', 'hbs');

app.use(express.static('public'));


app.get('/', function (req, res) {
  res.render('index', { 
  	title: 'Plebchat'
  });
});


/*
	Socket io stuff
*/

// all connected clients
var users = {};

io.on('connection', function(socket) {

	// join request
  socket.on('join', function(username) {

  	if (username == '') {
  		io.emit('usernameEmpty');
  	} else if (objectHasValue(users, username)) {
  		io.emit('usernameTaken', username);
  	} else {
  		users[socket.id] = username;
    	io.emit('joined', username);
  	}

  	console.log(users);
   
  });



	// chat message
  socket.on('messageRequest', function(msg) {

  	var currentUser = users[socket.id];
  	var now = dateFormat(new Date(), "H:MM");

    io.emit('messageResponse', {
    	username: currentUser,
    	timestamp: now,
    	message: msg
    });

  });

  // disconnecting
  socket.on('disconnect', function() {
  	var currentUser = users[socket.id];
    io.emit('left', currentUser);
  });


 
});

/*
	helper functions
*/

function objectHasValue(obj, val) {
	for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      if(obj[prop] === val) {
          return true;
      }
    }
	}
	return false;
}

function logArray(array) {
	console.log('in array:');
	for(var i = 0; i < array.length; i++) {
		console.log(i + ': ' + array[i]);
	}
}

http.listen(3000, function() {
  console.log('listening on *:3000');
});