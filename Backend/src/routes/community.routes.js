import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createCommunity,
    getAllCommunities,
    getMyCommunities,
    requestToJoin,
    handleJoinRequest,
    generateInviteLink,
    acceptInviteLink,
    getCommunity,
    getLeaderboard
} from "../controllers/community.controller.js"

const router = express.Router();

router.post("/", verifyJWT, createCommunity);
router.get("/", verifyJWT, getAllCommunities);
router.get("/my", verifyJWT, getMyCommunities);
router.get("/:id",verifyJWT, getCommunity);
router.post("/:communityId/request", verifyJWT, requestToJoin);
router.post("/:communityId/handle/:userId", verifyJWT, handleJoinRequest);
router.post("/:communityId/invite", verifyJWT, generateInviteLink);
router.post("/invite/:token", verifyJWT, acceptInviteLink);
router.get("/:communityId/leaderboard", verifyJWT, getLeaderboard);

export default router;
