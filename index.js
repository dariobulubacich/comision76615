const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = 8080;

// Servidor HTTP + Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Pasar socket.io a Express
app.set("io", io);

// Evento de conexión
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado vía WebSocket");
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
