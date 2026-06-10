import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

import {
  speechToText,
  getArtFeedback,
  enhanceDescription,
  generateTags,
} from "../controllers/ai.controller.js";

const router = express.Router();

// Voice → Text
router.post(
  "/speech-to-text", verifyJWT, upload.single("audio"),
  speechToText
);

// AI Art Mentor
router.post( 
"/art-feedback", verifyJWT,
  getArtFeedback
);

// AI Description Enhancer
router.post(
 "/enhance-description", verifyJWT,
  enhanceDescription
);

// AI Auto Tag Generator
router.post(
  "/generate-tags",verifyJWT,
   generateTags
);

export default router;