import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        submittedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        communityId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Community", 
            required: true 
        },
        challengeId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Challenge", 
            required: true 
        },
        content: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Artwork" // In case they submit an existing artwork
        },
        mediaUrl: {
            type: String // Direct link to media
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        pointsAwarded: {
            type: Number,
            default: null
        },
        rejectionNote: {
            type: String
        }
    },
    { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
