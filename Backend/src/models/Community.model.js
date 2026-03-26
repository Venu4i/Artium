import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },

        // Admin who created the community
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        // List of members
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isPrivate: { type: Boolean, default: false },

        // Invitation records
        invites: [
            {
                email: { type: String, required: true }, // invited user email
                token: { type: String, required: true }, // unique invite token
                invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who sent the invite
                status: {
                    type: String,
                    enum: ["pending", "accepted", "expired"],
                    default: "pending",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                    expires: 60 * 60 * 24 * 7, // ⏰ auto-delete after 7 days (optional)
                },
            },
        ],
    },
    { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);
export default Community;
