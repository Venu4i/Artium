import { Conversation } from "../models/Conversation.model.js";

/**
 * Get or create a 1–1 conversation
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.body; // receiver
    const myId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, userId],
        unreadCounts: {
          [myId.toString()]: 0,
          [userId]: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const myId = req.user._id;

    const conversations = await Conversation.find({
      participants: myId,
    })
      .populate("participants", "username avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};
