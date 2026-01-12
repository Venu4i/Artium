import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import { Conversation } from "../models/Conversation.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// @desc    Get all conversations for the sidebar (newest on top)
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "username profilePicture isOnline")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, conversations, "Conversations fetched"));
});

// @desc    Send a message (Supports both Private and Community)
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content, communityId } = req.body;

    if (!sender || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let newMessageData = { sender, content };
    let conversation;

    // Logic for Community Chat
    if (communityId) {
      newMessageData.community = communityId;
    } 
    // Logic for Private Chat
    else if (receiver) {
      newMessageData.receiver = receiver;
      
      // Find or Create Conversation
      conversation = await Conversation.findOne({
        participants: { $all: [sender, receiver] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [sender, receiver],
        });
      }
      newMessageData.conversationId = conversation._id;
    }

    const newMsg = await Message.create(newMessageData);

    // Update Conversation metadata if private
    if (conversation) {
      conversation.lastMessage = newMsg._id;
      const currentUnread = conversation.unreadCounts.get(receiver.toString()) || 0;
      conversation.unreadCounts.set(receiver.toString(), currentUnread + 1);
      await conversation.save();
    }

    const io = req.app.get("io");
    if (communityId) {
      io.to(`community:${communityId}`).emit("message:new", { message: newMsg });
    } else {
      io.to(`user:${receiver}`).emit("private:new", { message: newMsg, conversationId: conversation._id });
    }

    res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get messages and mark as read
export const getMessages = async (req, res) => {
  try {
    const { user1, user2, communityId } = req.query;

    // Community fetching logic
    if (communityId) {
      const messages = await Message.find({ community: communityId }).sort({ createdAt: 1 });
      return res.json(messages);
    }

    // Private fetching logic
    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    });

    if (!conversation) return res.json([]);

    // Mark unread as read (if the requester is the receiver of those messages)
    await Message.updateMany(
      { conversationId: conversation._id, receiver: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    // Reset unread count for current user
    conversation.unreadCounts.set(req.user._id.toString(), 0);
    await conversation.save();

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};