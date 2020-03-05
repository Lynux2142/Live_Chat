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

var rooms = { 'room1': {}, 'room2': {}, 'room3': {} };
var users = {};

io.sockets.on('connection', function(socket) {
	var address = socket.request.connection.remoteAddress;
	console.log('New connection from ' + address);

	socket.on('print_users', function() {
		console.log(rooms[socket.room]);
	});
	socket.on('add_user', function(username) {
		var tmp_username = username;
		for (let i = 1; users[tmp_username]; i++) {
			tmp_username = username + '(' + i + ')';
		}
		socket.username = tmp_username ? tmp_username : "Anonymous";
		users[socket.username] = socket.username;
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
		if (rooms[socket.room]) {
			delete rooms[socket.room][socket.username];
		}
		socket.room = new_room;
		socket.join(socket.room);
		join_message(socket);
		rooms[socket.room][socket.username] = address;
		socket.emit('update_rooms', rooms, socket.room);
	});

	socket.on('add_room', function(room_name) {
		rooms[room_name] = {};
	});

	socket.on('update', function() {
		socket.emit('update_rooms', rooms, socket.room);
	});

	socket.on('disconnect', function() {
		if (users[socket.username]) {
			delete users[socket.username];
			socket.broadcast.emit('chat_message', {
				username: 'SERVER',
				message: socket.username + ' has disconnect'
			});
			socket.leave(socket.room);
		}
		console.log('error disconnect');
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
	console.log(ip + ' - listening on *:' + port);
});
