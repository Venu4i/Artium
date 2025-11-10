// src/socket/index.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
//import {Notification} from "../models/Notification.model.js";
import Message from "../models/Message.model.js";
import Comment from "../models/Comment.model.js";

/**
 * Initializes socket.io server
 * Called from src/server.js
 */
export function initSocket(server, options = {}) {
  const io = new Server(server, {
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

    socket.join(`user:${userId}`); // personal room

    // ✅ Community Join/Leave
    socket.on("joinCommunity", (communityId) => {
      socket.join(`community:${communityId}`);
      console.log(`${socket.user.username} joined community:${communityId}`);
    });

    socket.on("leaveCommunity", (communityId) => {
      socket.leave(`community:${communityId}`);
    });

    // ✅ Post-specific join (for comments)
    socket.on("joinPost", (postId) => {
      socket.join(`post:${postId}`);
      console.log(`${socket.user.username} joined post:${postId}`);
    });

    socket.on("leavePost", (postId) => {
      socket.leave(`post:${postId}`);
    });

    // ✅ Comment: create and broadcast
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

        // Optionally create a notification for post owner (example)
        // const post = await Post.findById(payload.postId);
        // if (post && post.author.toString() !== userId) {
        //   const notif = await Notification.create({
        //     recipient: post.author,
        //     sender: userId,
        //     type: "comment",
        //     message: `${socket.user.username} commented on your post`,
        //   });
        //   io.to(`user:${post.author}`).emit("notification:new", notif);
        // }

        ack?.({ status: "ok", comment });
      } catch (err) {
        console.error("❌ Comment Error:", err.message);
        ack?.({ status: "error", error: err.message });
      }
    });

    // ✅ Community message
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

    // ✅ Notification send (for follow, like, etc.)
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

    // ✅ Disconnect cleanup
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

  // ✅ Expose helper for server-side emits (used from controllers)
  function emitNotification(recipientId, notification) {
    io.to(`user:${recipientId}`).emit("notification:new", notification);
  }

  return { io, onlineUsers, emitNotification };
}
