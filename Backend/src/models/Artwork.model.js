import mongoose from "mongoose";

const artworkSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      default: "", 
      trim: true 
    },
    // The visual content
    image: { 
      type: String, 
      required: true 
    },
    // Useful for deleting images from Cloudinary later
    imagePublicId: { 
      type: String, 
      default: "" 
    }, 
    
    // Categorization
    tags: [{ 
      type: String, 
      trim: true 
    }],
    
    // Relationships
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    community: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Community", 
      default: null 
    },

    // Engagement
    likes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    views: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

export const Artwork = mongoose.model("Artwork", artworkSchema);