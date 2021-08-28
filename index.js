const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 5000;

app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
   serveClient: false,
   cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
   }
});

let socket;
const players = [];

io.on('connection', (socketInstance) => {
   socket = socketInstance;
   console.log(socket.id);
   socket.on("init", (playerInfo) => {
     players.push(playerInfo);
     console.log(players);
   });
   socket.on("disconnect", () => {
      
   });
});

app.use('/assets', express.static(path.resolve('dist/assets')));
app.use("/maps", express.static(path.resolve("maps")));
app.use("/characters", express.static(path.resolve("characters")));
app.use(express.json());

app.get('/', (req, res) => {
   res.status(200).sendFile(path.resolve('dist/index.html'));
});

server.listen(PORT, () => console.log("Listening on PORT " + PORT));