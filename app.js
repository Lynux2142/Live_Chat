var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4242;
var ip = require('ip');

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	socket.username = 'Anonymous';
	socket.on('chat_message', function(msg) {
		io.emit('chat_message', { message: msg, username: socket.username });
	});
	socket.on('change_username', function(username) {
		socket.username = username;
	});
});

server.listen(port, ip.address(), function() {
	console.log('listening on *:' + port);
});
