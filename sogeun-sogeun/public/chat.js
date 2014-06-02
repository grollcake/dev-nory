var socket = io.connect();
var username = "";

function addMessage(type, msg, username, time) {
  var chat = "";
  var chat_mine = '\
                  <li class="left clearfix">  \
                    <div class="chat-body clearfix">  \
                      <strong class="primary-font pull-left">__USER__</strong><br>  \
                      <p class="pull-left">__MESSAGE__</p><br> \
                      <small class="text-muted pull-left"><span class="glyphicon glyphicon-time"></span>__TIME__</small> \
                    </div>  \
                  </li> \
';
  var chat_other = '\
                  <li class="right clearfix"> \
                    <div class="chat-body clearfix">  \
                      <strong class="primary-font pull-right">__USER__</strong><br>  \
                      <p class="pull-right">__MESSAGE__</p><br>  \
                      <small class="text-muted pull-right"><span class="glyphicon glyphicon-time"></span>__TIME__</small>  \
                    </div>  \
                  </li> \
';
  if ( type == "mine" ) {
    chat = chat_mine.replace("__USER__", username).replace("__MESSAGE__", msg).replace("__TIME__", time);
  }
  else if ( type = "chat" ) {
    chat = chat_other.replace("__USER__", username).replace("__MESSAGE__", msg).replace("__TIME__", time);
  }
  else if ( type = "info" ) {
  }
  $("#chat-entries").append(chat);
  
  // 맨아래 항목으로 스크롤링
  var el = $('.panel-body');
  // el.animate({scrollTop: el[0].scrollHeight}, 1000);
  el.scrollTop(el.prop('scrollHeight'));
}

function sentMessage() {
  if ($('#inputText').val() != "") {
    socket.emit('cmessage', $('#inputText').val());
    $('#inputText').val('');
  }
}

function setusername() {
  username = $('#nicknameText').val();
  if (username != "" ) {
    socket.emit('setUser', username);
    $('#modalNickname').modal('hide');
    $('#inputText').removeAttr('disabled');
    $('#inputSend').removeAttr('disabled');
    $("#inputText").focus();
  }
}

socket.on('smessage', function(data) {
  addMessage(data['type'], data['message'], data['user'], data['time']);
});

$(function(){
  $('#inputText').focus();

  $('#inputText').keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { sentMessage(); }
  });

  $('#inputSend').click(function(){sentMessage();});
  
  $('#modalNickname').on('shown.bs.modal', function() {
    $('#nicknameText').focus();
  });

  $('#nicknameText').keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { setusername(); }
  });

  $('#nicknameSend').click(function(){setusername();});

});


