// 환경설정
var service_port = 5000;
var EXPRESS_SID_KEY = 'express.sid';

// 선수입장
var express = require('express'), app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var util = require('util');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sessionStore = new session.MemoryStore();

// 서버 세팅
app.use(cookieParser());
//app.use(session({store:sessionStore, cookie:{httpOnly:true}, key:EXPRESS_SID_KEY}));
app.use(session({store:sessionStore, secret:'secret', key:EXPRESS_SID_KEY}));
app.use('/', express.static(__dirname + '/public'));

// 서버 기동
server.listen(service_port);
ulog("Magic happens on port " + service_port );

// 세션 타임아웃 방지를 위해 일정시간 간격으로 핑 메세지 전송
function sendHeartbeat(interval) {
  setTimeout(function(){ sendHeartbeat(interval) }, interval);
  //io.sockets.emit('ping', { beat : 1 });
  //ulog('Heartbeat "ping" sended to clients. interval is ' + interval);
  
  for (var i=0; i<io.sockets.sockets.length; ++i){
    io.sockets.sockets[i].beat_cnt = (io.sockets.sockets[i].beat_cnt ? io.sockets.sockets[i].beat_cnt+1 : 1)
    io.sockets.sockets[i].emit('ping', { beat : io.sockets.sockets[i].beat_cnt });
    ulog('[' + (i+1) + '/' +  io.sockets.sockets.length + ']Heartbeat "ping" sended to client '
         + io.sockets.sockets[i].id + ' {beat:' + io.sockets.sockets[i].beat_cnt + '}');
  } 
  
}
setTimeout(function() { sendHeartbeat(5*60*1000) }, 5*60*1000); // 5분 간격으로 heartbeat 송신

// 인증처리
/*
io.set('authorization', function (data, callback) {
    var_dump(data.headers.cookie);
    if(!data.headers.cookie) {
        ulog('cookie err');
        return callback('No cookie transmitted.', false);
    }
    // We use the Express cookieParser created before to parse the cookie
    // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser()(data, {}, function(parseErr) {
        if(parseErr) { ulog('parseErr');return callback('Error parsing cookies.', false); }
        // Get the SID cookie
        var sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
                        (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
                        (data.cookies && data.cookies[EXPRESS_SID_KEY]);
        
        // Then we just need to load the session from the Express Session Store
        sessionStore.load(sidCookie, function(err, session) {
            // And last, we check if the used has a valid session and if he is logged in
            if (err || !session || session.user == null) {
                callback('Not logged in.', false);
            } else {
                // If you want, you can attach the session to the handshake data, so you can use it again later
                // You can access it later with "socket.handshake.session"
                data.sessionID = session;
                callback(null, true);
            }
        });
    });
});
*/
io.set('authorization', function (data, accept) {
    var_dump(data.headers.cookie);
    if(!data.headers.cookie) {
        ulog('cookie err');
        return accept('No cookie transmitted.', false);
    }
    // We use the Express cookieParser created before to parse the cookie
    // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser()(data, {}, function(parseErr) {
      if(parseErr) { ulog('cookieParser error');return accept('Error parsing cookies.', false); }
      // Get the SID cookie
      data.sessionID = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
                       (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
                       (data.cookies && data.cookies[EXPRESS_SID_KEY]);
      ulog('sessionID is ' + data.sessionID);
      data.sessionStore = sessionStore;
      sessionStore.load(data.sessionID, function(err, session) {
        if ( err || !session ) {
          ulog('Error err:' + err);
          ulog('Error esssion:' + session);
          accept('Error', false);
        } else {
          data.session = new Session(data, session);
          accept(null, true)
        }
      });
    });
});

// 채팅서버 역할
io.sockets.on('connection', function(socket) {
  var client = socket.request.connection;
  ulog("new connection from " + client.remoteAddress + ':' + client.remotePort 
       + '. socketId=' + socket.id + ' sessionID ' + socket.handshake.sessionID);
  //var_dump(socket.request.connection);
  
  // 닉네임 변경 처리
  socket.on('setUser', function(cmsg) {
    var data = {}, smsg = '';
    var oldname = socket.username || '';
    socket.username = cmsg;

    if ( oldname == '' ) {
      smsg = socket.username + '님이 입장했습니다.';
    } else {
      smsg = oldname + '님이 ' + socket.username + '(으)로 대화명을 변경했습니다.';
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
  
  // heartbeat message 처리
  socket.on('pong', function(data) {
    ulog('heartbeat "pong" received from client ' + socket.id);
  });
  
  // 연결 종료 처리
  socket.on('disconnect', function() {
    ulog('Disconnected socket ' + socket.id );
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

function var_dump(x) {
  //console.log(JSON.stringify(x, null, 4));
  console.log(util.inspect(x, false, null));
}