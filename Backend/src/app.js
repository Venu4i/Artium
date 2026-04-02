import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import  {getIO}  from "./socket/index.js";

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
    req.io = getIO();
  } catch (err) {
     console.error("Socket not initialized yet"); 
  }
  next();
});

// ✅ Routes
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import artworkRouter from "./routes/artwork.routes.js";
import communityRouter from "./routes/community.routes.js";
import challengeRouter from "./routes/challenge.routes.js";


app.use("/api/v1/user", userRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/artworks", artworkRouter);
app.use("/api/v1/community", communityRouter);
app.use("/api/v1/challenges", challengeRouter);

// ✅ Health check (VERY useful)
app.get("/health", (_, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// 404 handler (so we log and return JSON instead of Express default HTML)
app.use((req, res) => {
  console.log("❌ 404:", req.method, req.url);
  res.status(404).json({ success: false, message: "Not found", path: req.url });
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