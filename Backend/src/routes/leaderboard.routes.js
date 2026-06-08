import { Router } from "express";
import { getGlobalLeaderboard, getCommunityLeaderboard } from "../controllers/leaderboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Global Leaderboard
router.get("/global", getGlobalLeaderboard);

// Community Leaderboard
router.get("/community/:communityId", getCommunityLeaderboard);

export default router;
