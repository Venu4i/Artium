import express from "express";
import { 
  getOrCreateConversation, 
  getMyConversations, 
  getRandomDiscoveryUsers // Make sure this is imported
} from "../controllers/conversation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT); // Protect all routes below

router.get("/", getMyConversations);
router.post("/", getOrCreateConversation);

// This is the line that matches chatService.getDiscoveryUsers
router.get("/discovery", getRandomDiscoveryUsers); 

export default router;