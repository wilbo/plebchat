var express = require('express');
var path = require('path');
var dateFormat = require('dateformat');

// create the app
var app = express();

// start server and intertwine socket io
var server = require('http').Server(app);
var io = require('socket.io')(server);

// templating
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// the public folder
app.use(express.static(path.join(__dirname, 'public')));


// the main 'page'
app.get('/', function (req, res) {
  res.render('index.html');
});

// redirect al other urls than '/'
app.use(redirectUnmatched);
function redirectUnmatched(req, res) {
  res.redirect("http://plebchat.wilbo.io");
}


/*
	Socket io stuff
*/

// all connected clients
var users = {};

io.on('connection', function(socket) {

  // on a join request
  socket.on('joinRequest', function(name) {
    // set data of this specific socket
  	var socketId = socket.id;

  	// username validation. checks for empty, length, symbols, or if already taken.
  	if (name == '') {
  		io.to(socketId).emit('usernameError', 'please submit a username');
  	} else if (name.length > 16) {
  		io.to(socketId).emit('usernameError', 'The username you provided is too long.');
  	} else if (containsSymbol(name)) {
  		io.to(socketId).emit('usernameError', 'Your username may only contain letters and numbers.');
  	} else if (usernameTaken(users, name)) {
  		io.to(socketId).emit('usernameError', 'username is already taken.');
  	} else {
  		// store the user
  		users[socketId] = name;
  		// send 'others' joined message
    	socket.broadcast.emit('joinResponse', name);
      // give user acces
      io.to(socketId).emit('access');
    	// globally update userlist
    	io.emit("updateUserList", users);
  	}   
  });

  // on a username value request
  socket.on('usernameRequest', function() {
    // set user data of this specific user/socket
    var socketId = socket.id;
    var currentUsername = users[socketId];

    io.to(socketId).emit('usernameResponse', currentUsername);
  });

	// on a chat message
  socket.on('messageRequest', function(msg) {
    // set user data of this specific user/socket
    var socketId = socket.id;
  	var currentUsername = users[socketId];

    // send 'others' the message .. the users own message gets appended locally
    socket.broadcast.emit('messageResponse', {
    	username: currentUsername,
    	message: msg
    });

  });

  // on disconnect
  socket.on('disconnect', function() {
    // set user data of this specific user/socket
    var socketId = socket.id;
    var currentUsername = users[socketId];

    // only if it was a joined user
  	if (currentUsername) {
      // globally send username that left 
  		io.emit('left', currentUsername);
      // remove user from storage
      delete users[socketId];
      // globally update userlist
	    io.emit("updateUserList", users);
  	}
  	
  });

 
});

/*
	helper functions
*/

// check if the a string has symbols
function containsSymbol(val) {
	var charArray = val.toLowerCase().split('');
	var allowedCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

	for (var i=0; i < charArray.length; i++) {
			if (allowedCharacters.indexOf(charArray[i]) == -1) {
				return true;
			}
	}

	return false;
}

// check if a value is inside an ibject
function usernameTaken(obj, val) {
	for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      if(obj[prop].toLowerCase() === val.toLowerCase()) {
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next();
});

server.listen(3000, function() {
  console.log('listening on *:3000');
});