import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userModel = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  // Password will be null for Google users
  password: {
    type: String,
    default: null,
  },

  googleId: {
    type: String,
    default: null
  },

  refreshToken: {
    type: String,
  },

  // Profile
  profilePicture: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: ""
  },

  joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],

  // Interactions
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork"
    }
  ],
  bookmarkedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork"
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// hash password only if present & changed
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
    { _id: this._id, email: this.email },
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