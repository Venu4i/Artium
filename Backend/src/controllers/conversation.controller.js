import { Conversation } from "../models/Conversation.model.js";
import User from "../models/User.model.js"
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

export const getRandomDiscoveryUsers = async (req, res, next) => {
  try {
    const myId = req.user._id;

    // 1. Get IDs of people I'm already talking to
    const existingConversations = await Conversation.find({ participants: myId });

    // Use optional chaining and a fallback empty array
    const existingContactIds = existingConversations?.flatMap(c => 
      c.participants.filter(p => p?.toString() !== myId.toString())
    ) || [];

    // 2. Find users NOT in that list and NOT me
    const discoveryUsers = await User.find({
      _id: { $nin: [...existingContactIds, myId] }
    })
    .select("username avatar bio")
    .limit(10);

    res.status(200).json({ success: true, data: discoveryUsers });
  } catch (err) {
    next(err);
  }
};
