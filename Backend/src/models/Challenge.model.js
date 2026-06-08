import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        community: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Community", 
            required: true 
        },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        // bannerImage: { type: String },
        deadline: { type: Date, required: true },
        mediaTypeAccepted: { type: String, default: "any" }, // e.g., "image", "audio", "video", "text", "any"
        maxPoints: { type: Number, required: true, default: 100 },
        
        status: {
            type: String,
            enum: ["DRAFT", "ACTIVE", "SUBMISSION_CLOSED", "REVIEW_IN_PROGRESS", "FINALIZED"],
            default: "ACTIVE"
        }
    },
    { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;