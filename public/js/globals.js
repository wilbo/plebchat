
$(document).ready(function() {


  var socket = io();

  // focus automagically
  $('#name-input').focus();

  /*
    Requests
  */

  // request to join
  $('#name-form button').click(function() {
    var username = $('#name-input').val();
    socket.emit('join', username);
    return false;
  });

  // request to post a message
  $('#message-form').submit(function() {
    var message = $('#message-input').val();
    socket.emit('messageRequest', message);
    $('#message-input').val('');
    return false;
  });

  /*
    Responses
  */

  // username error
  socket.on('usernameError', function(errorMessage) {
      $('#name-error').empty();
      $('#name-error').append(errorMessage);
  });

  // when connected
  socket.on('joined', function(username) {
    $('.overlay').fadeOut(200).remove();
    $('#message-input').focus();
    var output = '<div class="message-box"><div class="message">' + username + ' joined.</div></div>';
    $('#messages').append(output);
  });

  // append message
  socket.on('messageResponse', function(data) {
    output = '<div class="message-box"><div class="name">' + data.username + '</div><div class="time">' + data.timestamp + '</div><div class="message">' + data.message + '</div>';
    $('#messages').append(output);
  });

  // update userlist
  socket.on('updateUserList', function(users) {
    $("#user-list").empty();
    $.each(users, function(id, username) {
        $('#user-list').append('<li id="' + username + '">' + username + '</li>');
    });
  });

  // when disconnectes
  socket.on('left', function(username) {
    output = '<div class="message-box"><div class="message">' + username + ' has left.</div></div>';
    $('#messages').append(output);
  });

  /*
      Other stuff
  */


});