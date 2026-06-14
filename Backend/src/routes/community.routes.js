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
    getLeaderboard,
    getCommunityActivity,
    updateCommunity
} from "../controllers/community.controller.js"
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", verifyJWT, createCommunity);
router.get("/", verifyJWT, getAllCommunities);
router.get("/my", verifyJWT, getMyCommunities);
router.get("/:id",verifyJWT, getCommunity);
router.put("/:id", verifyJWT, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), updateCommunity);
router.post("/:communityId/request", verifyJWT, requestToJoin);
router.post("/:communityId/handle/:userId", verifyJWT, handleJoinRequest);
router.post("/:communityId/invite", verifyJWT, generateInviteLink);
router.post("/invite/:token", verifyJWT, acceptInviteLink);
router.get("/:communityId/leaderboard", verifyJWT, getLeaderboard);
router.get("/:communityId/activity", verifyJWT, getCommunityActivity);

export default router;
