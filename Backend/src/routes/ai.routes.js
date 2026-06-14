import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

import {
  getFeedback,
  generateArtChallenge,
  generateCreativeIdeas,
  generateTags,
  enhanceArtDescription,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post(
  "/art-feedback",
  getFeedback
);

router.post(
  "/generate-tags",
  generateTags
);

router.post(
  "/enhance-description",
  enhanceArtDescription
);


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