const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS
app.use(cors());

// Define a middleware function to send "hi" message
const sendHiMiddleware = (req, res, next) => {
  console.log('Sending "hi" message');
  res.send('Socket Server is Running ...');
};

// Use the middleware for all routes
app.use(sendHiMiddleware);

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
