$(document).ready(function() {

  // socket.io
  var socket = io();
  var localUsername = '';


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

    // store the username for local use
    localUsername = username;
    
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
      var output = '<div class="message-box clearfix"><div class="right-side"><div class="username">' + localUsername + '</div><div class="time"><small> ' + now + '</small></div><div class="message">' + message + '</div></div></div>';
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
  socket.on('joinResponse', function(username) {

    // output a 'user joined' notice
    var output = '<div class="message-box notice clearfix"><div class="left-side"><div class="message joined">' + username + ' joined.</div></div></div>';
    $('#messages').append(output);

    // update the scoll position of messages box
    updateScroll();
  });


  // Allow this user acces
  socket.on('access', function() {

    // remove the welcome box
    $('.name-box-window').fadeOut(200).remove();
    // show chet client
    $('#wrapper').addClass('slide-in');
  });


  // a user send a message
  socket.on('messageResponse', function(data) {

    // output the message
    var now = $.format.date(new Date(), 'H:mm');
    var output = '<div class="message-box clearfix"><div class="left-side"><div class="username">' + data.username + ' </div><div class="time"><small> ' + now + '</small></div><div class="message">' + data.message + '</div></div></div>';
    $('#messages').append(output);

    // update the scoll position of messages box
    updateScroll();
  });


  // update userlist
  socket.on('updateUserList', function(users) {

    // for debugging 
    //console.log(users);
    //console.log(Object.size(users));

    // for a future user list
    // $("#user-list").empty();
    // var userAmount = 0;
    // $.each(users, function(id, username) {
    //     $('#user-list').append('<li class="user" id="' + username + '"><i class="fa fa-user"></i> ' + username + '</li>');
    //     userAmount++;
    // });

    // update the amount of users connected
    var userAmount = Object.size(users);
    $('#amount-in-chat').html('<p><i class="fa fa-user"></i> ' + userAmount + '</p>');
  });


  // on user disconnect
  socket.on('left', function(username) {

    // output 'user left' notice
    output = '<div class="message-box notice clearfix"><div class="left-side"><div class="message left">' + username + ' has left.</div></div></div>';
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