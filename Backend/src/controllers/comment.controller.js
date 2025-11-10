import  Comment  from "../models/Comment.model.js";
import Notification  from "../models/Notification.model.js";

export const addComment = async (req, res) => {
  try {
    const { user, post, text, postOwner } = req.body;

    const comment = await Comment.create({ user, post, text });

    // create notification
    if (postOwner && postOwner !== user) {
      const notif = await Notification.create({
        recipient: postOwner,
        sender: user,
        type: "comment",
        message: "commented on your post",
      });

      const io = req.app.get("io");
      io.to(postOwner.toString()).emit("newNotification", notif);
    }

    res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};
