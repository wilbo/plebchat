
$(document).ready(function() {

  /*
      Socket.io stuff
  */

  var socket = io();

  // focus automagically
  $('#name-input').focus();

  // request to join
  $('#name-form').submit(function() {
    socket.emit('join', $('#name-input').val());
    return false;
  });

  // empty username field
  socket.on('usernameEmpty', function() {
      output = "Fill in a user name.";
      $('#name-form').append(output);
  });


  socket.on('usernameTaken', function() {
      output = "This username us already taken.";
      $('#name-form').append(output);
  });

  // when connected
  socket.on('joined', function(usr) {
    $('.overlay').fadeOut(200).remove();
    $('#message-input').focus();
    var output = '<div class="message-box"><div class="message">' + usr + ' joined.</div></div>';
    $('#messages').append(output);
  });

  // socket.on('connectMessage', function(socketName) {
  //   var message = '<div class="message-box"><div class="message">' + socketName + ' connected</div>';
  //   $('#messages').append(message);
  // })

  // socket.on('nameError', function(socketName) {
  //   var message = 'sorry, that name is already taken. Choose another.';
  //   $('#name-form').append(message);
  // });

  $('#message-form').submit(function() {
    var message = $('#message-input').val();
    socket.emit('messageRequest', message);
    $('#message-input').val('');
    return false;
  });

  socket.on('messageResponse', function(data) {
    output = '<div class="message-box"><div class="name">' + data.username + '</div><div class="time">' + data.timestamp + '</div><div class="message">' + data.message + '</div>';
    $('#messages').append(output);
  });

  // when disconnectes
  socket.on('left', function(usr) {
    output = '<div class="message-box"><div class="message">' + usr + ' has left.</div></div>';
    $('#messages').append(output);
  });

  /*
      Other stuff
  */

  function constructMessage(nm, ts, msg) {
    output = '';
    output += '<div class="message-box"><div class="name">';
    output += nm;
    output += '</div><div class="time">';
    output += ts;
    output += '</div><div class="message">';
    output += msg;
    output += '</div>';
    return output;
  }


});