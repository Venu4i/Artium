import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import cookie from "cookie";

const socketAuth = async (socket, next) => {
  try {
    // 1. Try to get token from handshake auth OR headers (cookies)
    let token = socket.handshake.auth.token;

    if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.accessToken; // 👈 Use the name of your cookie
    }

    if (!token) {
        console.error("❌ No token found in auth or cookies");
        return next(new Error("No token"));
    }

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
