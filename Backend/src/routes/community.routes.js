import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
    createCommunity,
    getAllCommunities,
    getMyCommunities,
    requestToJoin,
    handleJoinRequest,
    generateInviteLink,
    acceptInviteLink,
} from "../controllers/community.controller.js";

const router = express.Router();

router.post("/", verifyJWT, createCommunity);
router.get("/", verifyJWT, getAllCommunities);
router.get("/my", verifyJWT, getMyCommunities);
router.post("/:communityId/request", verifyJWT, requestToJoin);
router.post("/:communityId/handle/:userId", verifyJWT, handleJoinRequest);
router.post("/:communityId/invite", verifyJWT, generateInviteLink);
router.post("/invite/:token", verifyJWT, acceptInviteLink);

export default router;
