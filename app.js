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
var usernames = [];


io.on('connection', function(socket) {

  // on a join request
  socket.on('joinRequest', function(name) {

  	// username validation. checks for empty, length, symbols, or if already taken.
  	if (name == '') {
  		io.to(socket.id).emit('usernameError', 'please submit a username');
  	} else if (name.length > 16) {
  		io.to(socket.id).emit('usernameError', 'The username you provided is too long.');
  	} else if (containsSymbol(name)) {
  		io.to(socket.id).emit('usernameError', 'Your username may only contain letters and numbers.');
  	} else if (usernameTaken(usernames, name)) {
  		io.to(socket.id).emit('usernameError', 'username is already taken.');
  	} else {
      // add username for tacking
      usernames.push(name);

  		// store the user info
      var color = randomColor();
      socket.username = name;
      socket.color = color;
      
  		// send 'others' joined message
    	socket.broadcast.emit('joinResponse', socket.username, socket.color);
      // give user acces
      io.to(socket.id).emit('access', socket.username, socket.color);
    	// globally update userlist
    	io.emit("updateUserCount", usernames.length);
      console.log(usernames);

  	}   
  });

	// on a chat message
  socket.on('messageRequest', function(msg) {

    // send 'others' the message .. the users own message gets appended locally
    socket.broadcast.emit('messageResponse', {
    	username: socket.username,
    	message: msg,
      color: socket.color
    });

  });

  // on disconnect
  socket.on('disconnect', function() {

    // only if it was a joined user
  	if (socket.username) {
      // globally send username that left 
  		io.emit('left', socket.username, socket.color);
      // remove user from array
      removeFromArray(usernames, socket.username);
      // globally update userlist
	    io.emit("updateUserCount", usernames.length);

      console.log(usernames);
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
function usernameTaken(array, val) {
	for (var i = array.length - 1; i >= 0; i--) {
    if (array[i].toLowerCase() == val.toLowerCase()) {
      return true;
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

function randomColor() {
  var name = ['orange', 'wine-red', 'bright-red', 'red', 'purple', 'light-blue', 'blue', 'green', 'dark-green', 'pink', 'teal', 'marine' ];
  var color = ['#FAA916', '#96031A', '#F64740', '#FF3F3F', '#6F2DBD', '#3F88C5', '#00349E', '#06A77D', '#005B15', '#FF7AE0', '#1282A2', '#254441'];
  var rand = Math.floor((Math.random() * color.length));
  return color[rand];
}

function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
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