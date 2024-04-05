import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import googleAuthRoutes from "./routes/googleAuth.js";
import initializePassport from "./middlewares/passportConfig.js";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

initializePassport(app);

app.get("/", (req, res) => {
  res.send("GenUpNexus Server v2.0");
});

app.use("/auth", googleAuthRoutes);

// Socket.io Server
io.on('connection', (socket) => {
    console.log("A user connected");
  
    socket.on('pointerMove', (position) => {
      // Broadcast the pointer position to all other clients
      socket.broadcast.emit('remotePointerMove', position);
    });
  
    socket.on('disconnect', () => {
      console.log("User disconnected");
    });
  });

// MongoDB Config
const CONNECTION_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL)
  .then(() =>
    server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`))
  )
  .catch((error) => console.log(error.message));


