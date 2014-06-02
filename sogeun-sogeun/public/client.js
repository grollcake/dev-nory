var socket = io.connect();
var username = "";

function addMessage(msg, username, time) {
  $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + msg + '<span>' + time + '</span></p></div>');
}

function sentMessage() {
  if ($('#messageInput').val() != "") {
    socket.emit('cmessage', $('#messageInput').val());
    $('#messageInput').val('');
  }
}

function setusername() {
  username = $("#usernameInput").val();
  if (username != "" ) {
    socket.emit('setUser', username);
    $('#chatControls').show();
    $('#usernameInput').hide();
    $('#usernameSet').hide();
    $('#messageInput').focus();
  }
}

socket.on('smessage', function(data) {
  addMessage(data['message'], data['user'], data['time']);
});

$(function(){
  $("#chatControls").hide();
  $("#usernameSet").click(function(){setusername();});
  $("#usernameInput").focus();
  $("#usernameInput").keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { setusername(); }
  });
  $("#submit").click(function(){sentMessage();});
  $("#messageInput").keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { sentMessage(); }
  });
});

