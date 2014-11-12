var socket = io.connect();
var gNickname = "";

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
  var chat_info = '\
                <li class="center clearfix">  \
                  <span class="label label-info center-block">__MESSAGE__ \
                    <small class="text-muted"><span class="glyphicon glyphicon-time"></span>__TIME__</small>  \
                  <span>  \
                </li> \
';                
  if ( type == "mine" ) {
    chat = chat_mine.replace("__USER__", username).replace("__MESSAGE__", msg).replace("__TIME__", time);
  }
  else if ( type == "chat" ) {
    chat = chat_other.replace("__USER__", username).replace("__MESSAGE__", msg).replace("__TIME__", time);
  }
  else if ( type == "info" ) {
    chat = chat_info.replace("__USER__", username).replace("__MESSAGE__", msg).replace("__TIME__", time);
  }

  $("#chat-entries").append(chat);
  
  // 맨아래 항목으로 스크롤링
  var el = $('.panel-body');
  // el.animate({scrollTop: el[0].scrollHeight}, 1000);
  el.scrollTop(el.prop('scrollHeight'));
}

function sentMessage() {
  var msg  = $('#inputText').val();
  
  if ( ! socket.connected ) {
    alert('socket has been disconnected!');
    return false;
  }
  
  if ( msg != "") {
    if ( gNickname == '' ) {
      gNickname = msg;
      socket.emit('setUser', gNickname);
      $('#inputText').attr('placeholder', '여기에 적어보세요~');
      $('#inputSend').text('전송');
    } else {
      socket.emit('cmessage', msg);
    }
    $('#inputText').val('');
  }
}

function setusername() {
  nickname = $('#nicknameText').val();
  if (nickname != "" ) {
    gNickname = nickname;
    socket.emit('setUser', gNickname);
    $('#modalNickname').modal('hide');
    $("#inputText").focus();
  }
}

socket.on('smessage', function(data) {
  console.log(data['type'] + ':' + data['message']);
  addMessage(data['type'], data['message'], data['user'], data['time']);
});

socket.on('ping', function(data) {
  socket.emit('pong', {beat: data['beat']});
  console.log('ping received and sended pong:: {beat:' + data['beat'] + '}');
});

$(function(){
  $('#inputText').focus();

  $('#inputText').keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { sentMessage(); }
  });

  $('#inputSend').click(function(){sentMessage();});
  
  $('#modalNickname').on('shown.bs.modal', function() {
    if ( gNickname != '' ) {
      $('#nicknameText').val(gNickname);
    }
    $('#nicknameText').focus();
  });

  $('#nicknameText').keypress(function(e) {
    var k = ( e.keyCode ? e.keyCode : e.which);
    if ( k == '13' ) { setusername(); }
  });

  $('#nicknameSend').click(function(){setusername();});

});


