import express from "express";
import { 
  getOrCreateConversation, 
  getMyConversations, 
  getRandomDiscoveryUsers // Make sure this is imported
} from "../controllers/conversation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT); // Protect all routes below

// This is the line that matches chatService.getDiscoveryUsers
router.get("/discovery", getRandomDiscoveryUsers); 
router.get("/", getMyConversations);
router.post("/", getOrCreateConversation);



export default router;