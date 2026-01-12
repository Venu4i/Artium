import express from "express";
import { 
  sendPrivateMessage, 
  getPrivateMessages, 
  getConversations,
  sendCommunityMessage 
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

// Private Chat Routes
router.get("/conversations", getConversations); // sidebar list
router.post("/send-private", sendPrivateMessage);
router.get("/private/:receiverId", getPrivateMessages);

// Community Chat Route 
router.post("/send-community", sendCommunityMessage);

export default router;