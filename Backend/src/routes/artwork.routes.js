import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";
import {
  uploadArtwork,
  getFeed,
  getArtworkById,
  toggleLikeArtwork,
  addComment,
  getArtworksByOwner,
  getMyLikedArtworks,
  incrementShare,
} from "../controllers/artwork.controller.js";

const router = express.Router();

router.post("/upload", verifyJWT, upload.single("image"), uploadArtwork);
router.get("/feed", verifyJWT, getFeed);
router.get("/by-owner/:userId", verifyJWT, getArtworksByOwner);
router.get("/my-likes", verifyJWT, getMyLikedArtworks);
router.get("/:artworkId", verifyJWT, getArtworkById);
router.post("/:artworkId/like", verifyJWT, toggleLikeArtwork);
router.post("/:artworkId/comments", verifyJWT, addComment);
router.post("/:artworkId/share", verifyJWT, incrementShare);

export default router;