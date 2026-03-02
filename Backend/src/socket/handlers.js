import { sendMessage } from "../controllers/message.controller.js";
import { Conversation } from "../models/Conversation.model.js";
import Message from "../models/Message.model.js"

const registerSocketHandlers = (io, socket) => {
  // Personal room (for private chat)
  socket.join(socket.user._id.toString());

  // Join community room
  socket.on("join-community", (communityId) => {
    socket.join(communityId);
  });

  // Send message
socket.on("send-message", async (data) => {
    const {
        content,
        receiver,
        conversationId,
        attachments,
    } = data;

    const message = await Message.create({
        sender: socket.user._id,
        receiver,
        conversationId,
        content,
        attachments: attachments || [],
    });

    // Update conversation
    const conversation = await Conversation.findById(conversationId);

    conversation.lastMessage = message._id;

    // Increase unread count for receiver
    const receiverId = receiver.toString();
    const current = conversation.unreadCounts.get(receiverId) || 0;
    conversation.unreadCounts.set(receiverId, current + 1);

    await conversation.save();

    // Emit
    io.to(receiverId).emit("new-message", message);
    socket.emit("new-message", message);
    });


  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.user._id.toString());
  });
};

export default registerSocketHandlers;
