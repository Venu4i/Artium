import Message from "../models/Message.model.js"
import User from "../models/User.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMsg = await Message.create({ sender, receiver, content });

    // emit to receiver if online
    const io = req.app.get("io");
    io.to(receiver.toString()).emit("newMessage", newMsg);

    res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};
