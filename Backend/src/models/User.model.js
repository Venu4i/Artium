import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userModel = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true, // Ensure username is unique
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null, // Null for Google Auth users
    },
    googleId: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
    },

    // 🎨 Profile info (Visuals)
    profilePicture: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1633535288/sample.jpg", // Default placeholder
    },
    coverImage: { // NEW: For the profile banner
      type: String,
      default: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    },
    bio: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    
    // 🎨 Professional Info (NEW)
    skills: [{ // e.g., ["Digital Art", "3D Modeling", "Watercolor"]
      type: String,
      trim: true
    }],
    socialLinks: { // NEW: For external portfolio/socials
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" }
    },

    // 🤝 Social Graph (NEW)
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🖼️ Content
    posts: [{ // The artworks this user created
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Artwork" 
    }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
    bookmarkedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],

    // 🔔 Notifications & messages
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],

    // 👀 Socket integration
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // 🏆 Gamification & Progress
    points: { 
        type: Number, 
        default: 0 
    },
    completedChallenges: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Challenge" 
    }],
    
    // Community-specific points if you want separate leaderboards
    communityStats: [{
        community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
        points: { type: Number, default: 0 }
    }],
  },
  { timestamps: true }
);

// Hash password only if present & changed
userModel.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userModel.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userModel.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

userModel.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || "7d" }
  );
};

const User = mongoose.model("User", userModel);
export default User;