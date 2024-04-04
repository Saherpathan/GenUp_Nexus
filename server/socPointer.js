const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('pointerMove', (position) => {
    // Broadcast the pointer position to all other clients
    socket.broadcast.emit('remotePointerMove', position);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
