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
        rewardPoints: { type: Number, default: 10 }, // Points awarded on completion
        
        // Track submissions
        submissions: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                content: { type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }, // Link to the post/artwork uploaded
                submittedAt: { type: Date, default: Date.now }
            }
        ],
        
        status: {
            type: String,
            enum: ["active", "completed", "archived"],
            default: "active"
        }
    },
    { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;