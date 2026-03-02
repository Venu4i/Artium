import express from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {
  getOrCreateConversation,
  getMyConversations,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", verifyJWT, getOrCreateConversation);
router.get("/", verifyJWT, getMyConversations);

export default router;
