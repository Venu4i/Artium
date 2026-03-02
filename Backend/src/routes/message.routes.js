import express from "express";
import {
  getMessages,
  markAsRead,
} from "../controllers/message.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET chat history
router.get("/", verifyJWT, getMessages);

// Mark messages as read
router.post("/read", verifyJWT, markAsRead);

export default router;
