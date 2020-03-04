var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ip = require('ip').address();
var port = process.env.PORT || 4242;

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

var rooms = ['room1', 'room2', 'room3'];

io.sockets.on('connection', function(socket) {
	var address = socket.request.connection.remoteAddress;
	console.log('New connection from ' + address);
	socket.username = "Anonymous";
	socket.on('add_user', function(username) {
		socket.username = username ? username : "Anonymous";
		socket.emit('update_rooms', rooms, socket.room);
	});

	socket.on('chat_message', function(msg) {
		io.sockets.in(socket.room).emit('chat_message', {
			message: msg,
			username: socket.username
		});
	});

	socket.on('switch_room', function(new_room) {
		socket.leave(socket.room);
		leave_message(socket);
		socket.room = new_room;
		socket.join(socket.room);
		join_message(socket);
		socket.emit('update_rooms', rooms, socket.room);
	});

	socket.on('add_room', function(room_name) {
		rooms.push(room_name);
	});

	socket.on('update', function() {
		socket.emit('update_rooms', rooms, socket.room);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit('chat_message', {
			username: 'SERVER',
			message: socket.username + ' has disconnect'
		});
		socket.leave(socket.room);
	});
});

function join_message(socket) {
	socket.emit('chat_message', {
		username: 'SERVER',
		message: 'you have connected to ' + socket.room
	});
	socket.broadcast.to(socket.room).emit('chat_message', {
		username: 'SERVER',
		message: socket.username + ' has joined this room'
	});
}

function leave_message(socket) {
	socket.broadcast.to(socket.room).emit('chat_message', {
		username: 'SERVER',
		message: socket.username + ' has left this room'
	});
}

server.listen(port, ip, function() {
	console.log('listening on *:' + port);
});
