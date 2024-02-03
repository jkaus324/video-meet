const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
    console.log('A user connected');
  
    socket.on('join-room', ({roomId, userId}) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
    });
    // socket.on('disconnect', ({roomId, userId}) => {
    //   console.log(`User ${userId} disconnected from room ${roomId}`);
    //   io.to(roomId).emit('user-disconnected', userId); // Change this line
    // });
  });
  

server.listen(3000, () => {
  console.log('Server is running on port 3000'); // Add this line
});