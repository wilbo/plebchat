
$(document).ready(function() {


  var socket = io();

  // focus automagically
  $('#name-input').focus();
  $('#wrapper').hide();

  /*
    Requests
  */

  // request to join
  $('#name-form').submit(function(e) {
    e.preventDefault();
    var username = $('#name-input').val();
    socket.emit('join', username);
    return false;
  });

  // request to post a message
  $('#message-form').submit(function(e) {
    e.preventDefault();
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
      $('#name-error').html(errorMessage);
  });

  // when connected
  socket.on('joined', function(username) {
    $('.name-box-window').fadeOut(200).remove();
    var output = '<div class="message-box"><div class="message joined">' + username + ' joined.</div></div>';
    $('#messages').append(output);
    $('#message-input').focus();
    $('#wrapper').show().addClass('slide-in');
  });

  // append message
  socket.on('messageResponse', function(data) {
    output = '<div class="message-box"><div class="username">' + data.username + ' </div><div class="time"><small> ' + data.timestamp + '</small></div><div class="message">' + data.message + '</div></div>';
    $('#messages').append(output);
    updateScroll();
  });

  // update userlist
  socket.on('updateUserList', function(users) {
    $("#user-list").empty();
    var userAmount = 0;
    $.each(users, function(id, username) {
        $('#user-list').append('<li class="user" id="' + username + '"><i class="fa fa-user"></i> ' + username + '</li>');
        userAmount++;
    });
    $('#amount-in-chat').html('<p><i class="fa fa-user"></i> ' + userAmount + '</p>');
  });

  // when disconnectes
  socket.on('left', function(username) {
    output = '<div class="message-box"><div class="message left">' + username + ' has left.</div></div>';
    $('#messages').append(output);
  });

  /*
      Other stuff
  */

  function updateScroll() {
    var $cont = $('#messages');
    $cont[0].scrollTop = $cont[0].scrollHeight;
    console.log('scrolltop called');
  }

});