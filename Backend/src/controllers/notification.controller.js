import Notification from "../models/Notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifs = await Notification.find({ recipient: userId })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notifId } = req.params;
    const notif = await Notification.findByIdAndUpdate(
      notifId,
      { isRead: true },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
};
