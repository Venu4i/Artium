// src/socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
//import {Notification} from "../models/Notification.model.js";
import Message from "../models/Message.model.js";
import Comment from "../models/Comment.model.js";

// 🔴 CRITICAL FIX: Declare 'io' globally in this module so getIO can access it
let io;

/**
 * Initializes socket.io server
 * Called from src/server.js
 */
export function initSocket(server, options = {}) {
  // 🔴 FIX: remove 'const' so we update the global 'io' variable
  io = new Server(server, {
    cors: {
      origin: options.corsOrigin || "http://localhost:5173",
      credentials: true,
    },
  });

  // Map userId -> Set of socketIds
  const onlineUsers = new Map();

  // ✅ Middleware: authenticate socket connection
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers["authorization"]?.replace("Bearer ", "");

      if (!token) return next(new Error("No token provided"));

      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = { _id: payload._id, username: payload.username };
      next();
    } catch (err) {
      console.error("❌ Socket Auth Error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  // ✅ When connected
  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    console.log(`🟢 ${socket.user.username} connected`);

    // Track socket connections per user
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // 1. Setup (Private User Room)
    socket.on("setup", (userData) => {
      if(userData?._id) {
        socket.join(`user:${userData._id}`);
        socket.emit("connected");
        console.log(`👤 User joined private room: user:${userData._id}`);
      }
    });

    // 2. Community Join/Leave
    socket.on("joinCommunity", (communityId) => {
      socket.join(`community:${communityId}`);
      console.log(`${socket.user.username} joined community:${communityId}`);
    });

    socket.on("leaveCommunity", (communityId) => {
      socket.leave(`community:${communityId}`);
    });

    // 3. Post-specific join
    socket.on("joinPost", (postId) => {
      socket.join(`post:${postId}`);
      console.log(`${socket.user.username} joined post:${postId}`);
    });

    socket.on("leavePost", (postId) => {
      socket.leave(`post:${postId}`);
    });

    // 4. Comment: create and broadcast
    socket.on("comment:create", async (payload, ack) => {
      try {
        const comment = await Comment.create({
          postId: payload.postId,
          author: userId,
          content: payload.content,
          parentId: payload.parentId || null,
        });

        // Emit new comment to post subscribers
        io.to(`post:${payload.postId}`).emit("comment:new", { comment });

        ack?.({ status: "ok", comment });
      } catch (err) {
        console.error("❌ Comment Error:", err.message);
        ack?.({ status: "error", error: err.message });
      }
    });

    // 5. Community message
    socket.on("message:send", async (payload, ack) => {
      try {
        const message = await Message.create({
          community: payload.communityId,
          sender: userId,
          content: payload.content,
          attachments: payload.attachments || [],
        });

        io.to(`community:${payload.communityId}`).emit("message:new", { message });
        ack?.({ status: "ok", message });
      } catch (err) {
        console.error("❌ Message Error:", err.message);
        ack?.({ status: "error", error: err.message });
      }
    });

    // 6. Notification send
    socket.on("notification:send", async (payload, ack) => {
      try {
        const notif = await Notification.create({
          recipient: payload.recipient,
          sender: userId,
          type: payload.type,
          message: payload.message,
        });

        io.to(`user:${payload.recipient}`).emit("notification:new", notif);
        ack?.({ status: "ok", notif });
      } catch (err) {
        ack?.({ status: "error", error: err.message });
      }
    });

    // 7. Disconnect cleanup
    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) onlineUsers.delete(userId);
      }
      console.log(`🔴 ${socket.user.username} disconnected`);
    });
  });

  console.log("✅ Socket.IO initialized successfully");

  // ✅ Expose helper for server-side emits
  function emitNotification(recipientId, notification) {
    io.to(`user:${recipientId}`).emit("notification:new", notification);
  }

  return { io, onlineUsers, emitNotification };
}

// ✅ Correctly exported getter that reads the global 'io'
export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}