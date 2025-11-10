import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
    {
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    message: {
        type: String,
        trim: true,
    }, // optional message from the user
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, // admin who approved/rejected
    },
    { timestamps: true }
);

// Prevent duplicate requests (same user requesting same community multiple times)
joinRequestSchema.index({ community: 1, user: 1 }, { unique: true });

const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
export default JoinRequest;
