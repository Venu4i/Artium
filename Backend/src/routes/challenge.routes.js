import { Router } from "express";
import {
    createChallenge,
    submitToChallenge,
    closeSubmissions,
    reviewSubmission,
    finalizeChallenge,
    getChallengeDetails,
    getCommunityChallenges,
    getUserSubmissions
} from "../controllers/challenge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.use(verifyJWT);

// Create Challenge (Admin)
router.post("/:communityId", upload.single("coverImage"), createChallenge);

// Get community challenges
router.get("/community/:communityId", getCommunityChallenges);

// Get user submissions for a specific community
router.get("/community/:communityId/user-submissions", getUserSubmissions);

// Get single challenge details
router.get("/:challengeId", getChallengeDetails);

// Submit to challenge
router.post("/:challengeId/submit", upload.single("file"), submitToChallenge);

// Close submissions (Admin)
router.put("/:challengeId/close-submissions", closeSubmissions);

// Review submission (Admin)
router.put("/submission/:submissionId/review", reviewSubmission);

// Finalize challenge (Admin)
router.put("/:challengeId/finalize", finalizeChallenge);

export default router;