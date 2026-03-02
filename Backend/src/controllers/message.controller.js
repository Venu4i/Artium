import Message from "../models/Message.model.js";
import { Conversation } from "../models/Conversation.model.js";

export const sendMessage = async ({ socket, io, data }) => {
  const {
    content,
    receiver,
    conversationId,
    community,
    attachments,
  } = data;

  if (!content) {
    throw new Error("Message content is required");
  }

  // Save message
  const message = await Message.create({
    sender: socket.user._id,
    receiver: receiver || null,
    conversationId: conversationId || null,
    community: community || null,
    content,
    attachments: attachments || [],
  });

  // Emit to private chat
  if (receiver) {
    io.to(receiver.toString()).emit("new-message", message);
    socket.emit("new-message", message);
  }

  // Emit to community chat
  if (community) {
    io.to(community.toString()).emit("new-message", message);
  }

  return message;
};
/**
 * GET messages for private conversation OR community
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId, communityId } = req.query;

    if (!conversationId && !communityId) {
      return res.status(400).json({
        success: false,
        message: "conversationId or communityId is required",
      });
    }

    const query = conversationId
      ? { conversationId }
      : { community: communityId };

    const messages = await Message.find(query)
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const myId = req.user._id.toString();

    await Message.updateMany(
      { conversationId, receiver: myId, isRead: false },
      { isRead: true }
    );

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${myId}`]: 0 },
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (err) {
    next(err);
  }
};

