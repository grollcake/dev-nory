﻿// 환경설정
var service_port = 5500;

// 선수입장
var express = require('express'), app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// 서버 기동
app.use('/', express.static(__dirname + '/public'));
server.listen(service_port);
ulog("Magic happens on port " + service_port );

// 채팅서버 역할
io.sockets.on('connection', function(socket) {
  ulog("new connection");
  
  // 닉네임 변경 처리
  socket.on('setUser', function(cmsg) {
    var data, smsg;
    var oldname = socket.username || '';
    socket.username = cmsg;

    if ( oldname == '' ) {
      smsg = socket.username + '님이 입장했습니다.';
    } else {
      smsg = oldname + '님이 ' + socket.username + '으로 대화명을 변경했습니다.';
    }
    
    data = {type:'info', user:socket.username, message:smsg, time:getTime()};
    socket.broadcast.emit('smessage', data);   // 다른 사용자에게 메세지 전송
    socket.emit('smessage', data);
    ulog(smsg);
  });
  
  // 채팅 메세지 처리
  socket.on('cmessage', function(cmsg) {
    username = socket.username;
    var data1 = {type:'chat', user:username, message:cmsg, time:getTime()};
    var data2 = {type:'mine', user:username, message:cmsg, time:getTime()};
    socket.broadcast.emit('smessage', data1);   // 다른 사용자에게는 chat으로 메세지 전송
    socket.emit('smessage', data2);  // 본인에게는 mine으로 메세지 전송
    ulog("user " + username + " said this: " + cmsg);
  });
  
  // 채팅 명렁어 처리
  socket.on('command', function(cmsg) {
    username = socket.username;
    ulog("user " + username + " send this command: " + cmsg);
    var data = {type:'info', user:username, message:cmsg, time:getTime()};
    io.sockets.socket(socket.id).emit('smessae', data);
  });
});


// ------------------------------------------------------------------------------------- //
function getTime() {
  var date = new Date();
  var hour = date.getHours();
  hour = ( hour < 10 ? "0" : "" ) + hour;
  var min = date.getMinutes();
  min = ( min < 10 ? "0" : "" ) + min;
  var sec = date.getSeconds();
  sec = ( sec < 10 ? "0" : "" ) + sec;
  
  return hour + ":" + min + ":" + sec;
}

function ulog(msg) {
  console.log("[" + getTime() + "] " + msg);
}
