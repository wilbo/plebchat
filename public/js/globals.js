$(document).ready(function() {

  // socket.io
  var socket = io();
  var localUsername = '';
  var localUsernameColor = '';


  /*
    Requests
  */

  // request to join
  $('#name-form').submit(function(e) {
    e.preventDefault();
    
    // retrieve username from username input field
    var username = $('#name-input').val();
    // send a join request
    socket.emit('joinRequest', username);
    
    return false;
  });


  // request to post a message
  $('#message-form').submit(function(e) {
    e.preventDefault();

    // retrieve message form message input field
    var message = $('#message-input').val();

    // as long as the message is not empty
    if (message != '') {
      
      // send a message request
      socket.emit('messageRequest', message);  

      // output the user message locally
      var now = $.format.date(new Date(), 'H:mm');
      var output = '<div class="message-box clearfix"><div class="right-side"><div class="username" style="color: ' + localUsernameColor + ';">' + localUsername + '</div><div class="time"><small> ' + now + '</small></div><div class="message">' + message + '</div></div></div>';
      $('#messages').append(output);

      // update the scoll position of messages box
      updateScroll();
      // empty the message input field
      $('#message-input').val('');
    }

    return false;
  });

  /*
    Responses
  */

  // username validation error
  socket.on('usernameError', function(errorMessage) {

      // display error
      $('#name-error').html(errorMessage);
  });


  // when a user joined
  socket.on('joinResponse', function(username, color) {

    // output a 'user joined' notice
    var output = '<div class="message-box notice clearfix"><div class="left-side"><div class="message joined"><span style="color:' + color + ';font-weight:bold;">' + username + '</span> joined.</div></div></div>';
    $('#messages').append(output);

    // update the scoll position of messages box
    updateScroll();
  });


  // Allow this user acces
  socket.on('access', function(username, color) {

    // store local user info
    localUsername = username;
    localUsernameColor = color;

    // remove the welcome box
    $('.name-box-window').fadeOut(200).remove();
    // show chet client
    $('#wrapper').addClass('slide-in');
  });


  // a user send a message
  socket.on('messageResponse', function(data) {

    // output the message
    var now = $.format.date(new Date(), 'H:mm');
    var output = '<div class="message-box clearfix"><div class="left-side"><div class="username" style="color:' + data.color + ';">' + data.username + ' </div><div class="time"><small> ' + now + '</small></div><div class="message">' + data.message + '</div></div></div>';
    $('#messages').append(output);

    // update the scoll position of messages box
    updateScroll();
  });


  // update usercount
  socket.on('updateUserCount', function(userCount) {
    $('#amount-in-chat').html('<p>in chat: ' + userCount + ' </p>');
  });


  // on user disconnect
  socket.on('left', function(username, color) {

    // output 'user left' notice
    output = '<div class="message-box notice clearfix"><div class="left-side"><div class="message left"><span style="color:' + color + ';font-weight:bold;">' + username + '</span> has left.</div></div></div>';
    $('#messages').append(output);

    // update the scoll position of messages box
    updateScroll();
  });

  /*
      Other stuff
  */

  // this function keeps the scoll position at the bottom in the message box
  function updateScroll() {
    var $cont = $('#messages');
    $cont[0].scrollTop = $cont[0].scrollHeight;
  }

  // get the length of an object, helper
  Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

});