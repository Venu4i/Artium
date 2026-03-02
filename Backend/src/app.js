import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { getIO } from "./socket/index.js"; // 👈 CRITICAL: Added this import

dotenv.config();

const app = express();

// ✅ Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SEC,
});

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
import messageRouter from "./routes/message.routes.js"
import conversationRouter from "./routes/conversation.routes.js"
app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter)
app.use("/api/v1/conversations", conversationRouter)

// ✅ Health check (VERY useful)
app.get("/health", (_, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;