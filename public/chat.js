var socket = io();
var messages = $('#messages');

socket.on('connect', function() {
	socket.emit('add_user', prompt("What's your name?"));
});

socket.on('chat_message', function(data) {
	messages.append('<li><b>' + data.username + ':</b> ' + data.message + '</li>');
	window.scrollTo(0, document.body.scrollHeight);
});

socket.on('update_rooms', function(rooms, current_room) {
	$('#rooms').empty();
	$.each(rooms, function(key, value) {
		if (value == current_room) {
			$('#rooms').append('<div>' + value + '</div>');
		} else {
			$('#rooms').append('<div><a href="#" onclick="switch_room(\'' + value + '\')">' + value + '</a></div>');
		}
	});
});

function switch_room(room) {
	socket.emit('switch_room', room);
}

$(function () {
	var message_box = $('#m');
	var create_room = $('#create_room');
	var update_rooms = $('#update_rooms');

	$('form').submit(function(e) {
		e.preventDefault();
		socket.emit('chat_message', message_box.val());
		message_box.val('');
		return false;
	});

	create_room.click(function() {
		var room_name = prompt('Room name?');
		if (room_name) {
			socket.emit('add_room', room_name);
			switch_room(room_name);
		}
	});

	update_rooms.click(function() {
		socket.emit('update');
	});
});
