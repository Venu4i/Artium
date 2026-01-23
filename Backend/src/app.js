// src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { getIO } from "./socket/index.js"; // 👈 CRITICAL: Added this import

dotenv.config();

// ✅ Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SEC,
});

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Socket Middleware
app.use((req, res, next) => {
  try {
    req.io = getIO(); // Now this function exists because we imported it!
  } catch (err) {
    // It's normal for IO to not be ready for the very first split second or in tests
    // console.error("Socket not initialized yet"); 
  }
  next();
});

// ✅ Routes
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import commentRouter from "./routes/comment.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import communityRouter from "./routes/community.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/community", communityRouter);

// ✅ Global error handler
app.use((err, _, res, next) => {
  console.error("🔥 Error Handler:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;