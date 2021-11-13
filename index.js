const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { nanoid } = require("nanoid");
const checkForAgreements = require("./utils/requestHandler");
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
const requests = [];
const rooms = {};

io.on("connection", (socket) => {
  socket.on("init", (playerInfo, callback) => {
    players[playerInfo.socId] = playerInfo;
    callback(players);
    socket.broadcast.emit("new-player", playerInfo);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    socket.broadcast.emit("remove-player", socket.id);
  });

  /*
          | 1 |
      -----------
      | 4 | 3 | 2 |
  */
  socket.on("player-key-down", (data) => {
    const movementData = {};
    movementData.socId = data.socId;
    if (!players[data.socId].keyDown) {
      players[data.socId].keyDown = {
        vertical: null,
        horizontal: null,
      };
    }
    if (data.key === 1 || data.key === 3) {
      movementData["vertical"] = data.key;
      players[data.socId].keyDown["vertical"] = data.key;
    }
    if (data.key === 2 || data.key === 4) {
      movementData["horizontal"] = data.key;
      players[data.socId].keyDown["horizontal"] = data.key;
    }
    socket.broadcast.emit("move-player", movementData);
  });

  socket.on("player-key-up", (data) => {
    if (players[data.socId].keyDown) {
      players[data.socId].keyDown[data.movement] = null;
    }
    players[data.socId].x = data.x;
    players[data.socId].y = data.y;
    socket.broadcast.emit("stop-player", data);
  });

  //Data Communication
  /*
    data {
      type: string,
      fromSocId: string,
      toSocId: string,
    }
  */
  socket.on("init-chat", (data) => {
    if (data.type === "cancel") {
      io.to(data.toSocId).emit("cancel-chat");
    }
    const [type, index] = checkForAgreements(requests, data);
    if (!type) {
      requests.push(data);
    } else {
      const room = nanoid();
      //Add players to the private room
      const player1 = io.sockets.sockets.get(data.fromSocId);
      const player2 = io.sockets.sockets.get(data.toSocId);
      player1.join(room);
      player2.join(room);
      rooms[room] = {
        clients: [player1.id, player2.id],
      };
      io.to(room).emit("start-chat", {
        type: type,
        roomName: room,
        participants: [player1.id, player2.id],
      });
      //Create a room and send a data packet to the clients in the room
      requests.splice(index, 1);
    }
  });

  socket.on("cancel-request", (data) => {
    const index = requests.findIndex(
      (request) => request.fromSocId === data.fromSocId
    );
    requests.splice(index, 1);
  });

  socket.on("new-message", (data) => {
    socket.broadcast.to(data.roomName).emit("add-message", data.message);
  });
});

//Server code
app.use(cors());
app.use("/maps", express.static(path.resolve("maps")));
app.use("/characters", express.static(path.resolve("characters")));
app.use("/thumbnails", express.static(path.resolve("thumbnails")));
app.use(express.json());

app.use("/", express.static("./dist"));

server.listen(PORT, () => console.log("Listening on PORT " + PORT));
