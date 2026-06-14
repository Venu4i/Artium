import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

import {
  getFeedback,
  generateArtChallenge,
  generateCreativeIdeas
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post(
  "/art-feedback",
  getFeedback
);

// Image + Description → AI Analysis
// router.post(
//   "/analyze-artwork",
//   upload.single("image"),
//   analyzeArtwork
// );

// Generate Challenges
router.post(
  "/art-challenge",
  generateArtChallenge
);

// Generate Creative Ideas
router.post(
  "/creative-ideas",
  generateCreativeIdeas
);

export default router;