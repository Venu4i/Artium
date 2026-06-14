import { Conversation } from "../models/Conversation.model.js";
import User from "../models/User.model.js"
import mongoose from "mongoose";
/**
 * Get or create a 1–1 conversation
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.body; // receiver
    const myId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    }).populate("participants", "username profilePicture");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, userId],
        unreadCounts: {
          [myId.toString()]: 0,
          [userId]: 0,
        },
      });
      conversation = await conversation.populate("participants", "username profilePicture");
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
      .populate("participants", "username profilePicture")
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
    const myId = new mongoose.Types.ObjectId(req.user._id);

    const existingConversations = await Conversation.find({
      participants: myId
    });

    const existingContactIds = existingConversations.flatMap(c => {
      if (!Array.isArray(c.participants)) return [];

      return c.participants
        .map(p =>
          typeof p === "string"
            ? new mongoose.Types.ObjectId(p)
            : p
        )
        .filter(p => p && !p.equals(myId));
    });

    const excludedIds = [...existingContactIds, myId];

    console.log("Excluded:", excludedIds.map(id => id.toString()));

    const discoveryUsers = await User.find({
      _id: { $nin: excludedIds }
    })
      .select("username profilePicture bio")
      .limit(10);

    console.log("Discovery Users:", discoveryUsers);

    res.status(200).json({
      success: true,
      data: discoveryUsers
    });
  } catch (err) {
    next(err);
  }
};
