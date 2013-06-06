exports.initSocket = function(io) {
    io.sockets.on('connection', function(socket) {
        console.log('Client Connected');

        socket.on('message', function(data) {
            socket.broadcast.emit('server_message', data);
            socket.emit('server_message', data);
        });

        socket.on('disconnect', function() {
            console.log('Client Disconnected.');
        });
    });
}
