// models/Message.js - community chat
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
}, { timestamps: true });
export default mongoose.model("Message", messageSchema);
