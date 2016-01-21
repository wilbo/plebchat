
$(document).ready(function() {


  var socket = io();

  if (!localUsername) {
    var localUsername;
  }

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

    if (message != '') {
        
      socket.emit('messageRequest', message);

      // append de message locally
      var now = $.format.date(new Date(), 'H:mm');
      output = '<div class="message-box clearfix"><div class="right-side"><div class="username">' + localUsername + '</div><div class="time"><small> ' + now + '</small></div><div class="message">' + message + '</div></div></div>';
      $('#messages').append(output);
      updateScroll();

      $('#message-input').val('');

    }

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
    localUsername = username;
    $('.name-box-window').fadeOut(200).remove();
    var output = '<div class="message-box clearfix"><div class="left-side"><div class="message joined">' + username + ' joined.</div></div></div>';
    $('#messages').append(output);
    $('#message-input').focus();
    $('#wrapper').show().addClass('slide-in');
  });

  // append message others
  socket.on('messageResponse', function(data) {
    var now = $.format.date(new Date(), 'H:mm');
    output = '<div class="message-box clearfix"><div class="left-side"><div class="username">' + data.username + ' </div><div class="time"><small> ' + now + '</small></div><div class="message">' + data.message + '</div></div></div>';
    $('#messages').append(output);
    updateScroll();
  });

  // update userlist
  socket.on('updateUserList', function(users) {

    if (localUsername == 'wilbo') {
      console.log('new userlist: ');
      console.log(JSON.parse(JSON.stringify(users)));
    }

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
    output = '<div class="message-box clearfix"><div class="left-side"><div class="message left">' + username + ' has left.</div></div></div>';
    $('#messages').append(output);
  });

  /*
      Other stuff
  */

  function updateScroll() {
    var $cont = $('#messages');
    $cont[0].scrollTop = $cont[0].scrollHeight;
  }

});