import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  mediaUrl: { type: String, required: true },
  mediaPublicId: { type: String, default: "" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Artwork", artworkSchema);
