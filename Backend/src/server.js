// src/server.js
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./DB/index.js";
import { initSocket } from "./socket/index.js";

dotenv.config();

// ✅ Create HTTP server for Express app
const server = http.createServer(app);

// ✅ Initialize Socket.IO on the same server
const io = initSocket(server);
app.set("io", io); // makes io accessible inside controllers if needed

// ✅ Connect to MongoDB
connectDB();

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
