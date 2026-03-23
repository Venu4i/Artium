import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./DB/index.js";
import http from "http";
import { Server } from "socket.io";

import socketAuth from "./socket/index.js";
import registerSocketHandlers from "./socket/handlers.js";

dotenv.config();

// ✅ Connect DB
connectDB();

// ✅ Create HTTP server
const server = http.createServer(app);
server.setTimeout(10 * 60 * 1000);
// ✅ Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// ✅ Socket auth middleware (MUST be before connection)
io.use(socketAuth);

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.user._id.toString());

  // Delegate ALL logic
  registerSocketHandlers(io, socket);
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
