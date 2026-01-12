import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For Private Chat
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // For Community Chat 
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;