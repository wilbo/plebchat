var express = require('express');
var path = require('path');
var hbs = require('hbs');
var dateFormat = require('dateformat');

// create the app
var app = express();

// start server and intertwine socket io
var server = require('http').Server(app);
var io = require('socket.io')(server);

// for hbs templating
hbs.localsAsTemplateData(app);
app.set('views', './views');
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views');


// the public folder
app.use(express.static(path.join(__dirname, 'public')));


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
  socket.on('join', function(name) {

  	if (name == '') {
  		// if no name was provided
  		io.emit('usernameError', 'please submit a username');
  		//return false;
  	} else if (containsSymbol(name)) {
  		// if name contains wrong characters
  		io.emit('usernameError', 'Your username may only contain letters and numbers.');
  		//return false;
  	} else if (usernameTaken(users, name)) {
  		// if name already taken
  		io.emit('usernameError', 'username is already taken.');
  		//return false;
  	} else {
  		// of everything is cool
  		users[socket.id] = name;
    	io.emit('joined', name);
    	io.emit("updateUserList", users);
  	}
  	
  	//console.log(users);
   
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