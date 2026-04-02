import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js"; 
import {
    createChallenge,
    getCommunityChallenges,
    submitToChallenge,
    getChallengeLeaderboard,
    getChallengeDetails
} from "../controllers/challenge.controller.js";

const router = express.Router();

// 🏆 Challenge Management
// Admin creates a challenge for a specific community
router.post("/:communityId", verifyJWT, createChallenge);

// Get all challenges for a specific community
router.get("/community/:communityId", verifyJWT, getCommunityChallenges);

// Get specific details of one challenge
router.get("/:challengeId", verifyJWT, getChallengeDetails);

// 🎨 Participation
// User submits their work (requires artwork upload)
router.post("/:challengeId/submit", verifyJWT, upload.single('artwork'), submitToChallenge);

// 📊 Stats & Leaderboard
// Get leaderboard for a specific challenge or community
router.get("/:challengeId/leaderboard", verifyJWT, getChallengeLeaderboard);

export default router;