import express from "express";
import { 
  sendMessage, 
  getMessages, 
  getConversations,
  // sendCommunityMessage 
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);

// Private Chat Routes
router.get("/conversations", getConversations); // sidebar list
router.post("/send-private", sendMessage);
router.get("/private/:receiverId", getMessages);

// Community Chat Route 
// router.post("/send-community", sendCommunityMessage);

export default router;