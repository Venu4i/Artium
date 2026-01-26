import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js"; // Your Multer config
import { uploadArtwork, getFeed } from "../controllers/artwork.controller.js";

const router = express.Router();

router.post("/upload", verifyJWT, upload.single("image"), uploadArtwork);
router.get("/feed",verifyJWT, getFeed); // Feed can be public, or verifyJWT if private

export default router;