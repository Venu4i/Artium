// models/Notification.js
import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
  type: { type: String, enum: ["comment", "like", "follow", "invite", "mention", "challenge"], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who caused it
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
  message: { type: String }, // human readable
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("Notification", notificationSchema);
