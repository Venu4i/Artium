import express from "express";
import { addComment, getComments } from "../controllers/comment.controller.js";
const router = express.Router();

router.post("/add", addComment);
router.get("/:postId", getComments);

export default router;
