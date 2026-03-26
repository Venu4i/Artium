import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const socketAuth = async (socket, next) => {
  try {
    console.log("🔎 Handshake auth:", socket.handshake.auth);

    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    console.log("🔎 Token received:", token);


    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("_id username");
    console.log("🔎 User found:", user?._id);

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (error) {
    console.error("❌ Socket Auth Error:", error.message); // This will tell you the truth
    next(new Error("Unauthorized"));
  }
};

export default socketAuth;
