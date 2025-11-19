const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 8080;

const server = http.createServer(app);
const io = new Server(server);

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado vía WebSocket");
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
