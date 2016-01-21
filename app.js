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



	// join request
  socket.on('join', function(name) {

  	//console.log(socket.client);

  	var socketId = socket.id;

  	// username validation
  	if (name == '') {
  		io.to(socketId).emit('usernameError', 'please submit a username');
  	} else if (name.length > 16) {
  		io.to(socketId).emit('usernameError', 'The username you provided is too long.');
  	} else if (containsSymbol(name)) {
  		io.to(socketId).emit('usernameError', 'Your username may only contain letters and numbers.');
  	} else if (usernameTaken(users, name)) {
  		io.to(socketId).emit('usernameError', 'username is already taken.');
  	} else {
  		// if everything is cool

  		// store the user
  		users[socketId] = name;
  		// let user join
    	io.to(socketId).emit('joined', name);
    	// update total connected users
    	io.emit("updateUserList", users);

  	}
  	
  	//console.log(users);
   
  });

	// chat message
  socket.on('messageRequest', function(msg) {

  	var currentUser = users[socket.id];

    socket.broadcast.emit('messageResponse', {
    	username: currentUser,
    	message: msg
    });

  });

  // disconnecting
  socket.on('disconnect', function() {
  	var currentUser = users[socket.id];
  	// only if it was a joined user
  	if (currentUser) {
  		io.emit('left', currentUser);
	    delete users[socket.id];
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