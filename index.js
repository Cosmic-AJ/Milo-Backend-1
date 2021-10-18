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

let socket;
const players = [];

io.on("connection", (socketInstance) => {
  socket = socketInstance;
  console.log(socket.id);
  socket.on("init", (playerInfo) => {
    players.push(playerInfo);
    console.log(players);
  });
  socket.on("disconnect", () => {});
});
app.use(cors());
app.use("/maps", express.static(path.resolve("maps")));
app.use("/characters", express.static(path.resolve("characters")));
app.use("/thumbnails", express.static(path.resolve("thumbnails")));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Milo!" });
});

server.listen(PORT, () => console.log("Listening on PORT " + PORT));
