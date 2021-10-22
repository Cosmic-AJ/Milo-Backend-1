const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const PORT = process.env.PORT || 5000;

app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  serveClient: false,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const players = {};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("init", (playerInfo, callback) => {
    players[playerInfo.socId] = playerInfo;
    console.log("\nInit\n---------------", players);
    callback(players);
    socket.broadcast.emit("new-player", playerInfo);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    socket.broadcast.emit("remove-player", socket.id);
    console.log("Disconnect\n---------------", players);
  });

  socket.on("player-movement", (data) => {
    console.log(data);
    players[data.socId].x = data.x;
    players[data.socId].y = data.y;
    socket.broadcast.emit("move-player", data);
  });

  socket.on("player-key-down", (data) => {
    players[data.socId].keyDown = data.key;
    console.log("Key Down", players[data.socId].keyDown);
    socket.broadcast.emit("move-player", data);
  });

  socket.on("player-key-up", (data) => {
    players[data.socId].keyDown = null;
    players[data.socId].x = data.x;
    players[data.socId].y = data.y;
    console.log("Key Up", players[data.socId].keyDown);
    socket.broadcast.emit("stop-player", data);
  });
});
app.use(cors());
app.use("/maps", express.static(path.resolve("maps")));
app.use("/characters", express.static(path.resolve("characters")));
app.use("/thumbnails", express.static(path.resolve("thumbnails")));
app.use(express.json());

app.use("/", express.static("./dist"));

server.listen(PORT, () => console.log("Listening on PORT " + PORT));
