import express from "express";
import {
    createCommunity,
    sendJoinRequest,
    viewPendingRequests,
    handleJoinRequest,
    sendInvite,
    acceptInvite,
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const communityRouter = express.Router();

communityRouter.post("/create", verifyJWT, createCommunity);
communityRouter.post("/:id/join", verifyJWT, sendJoinRequest);
communityRouter.get("/:id/requests", verifyJWT, viewPendingRequests);
communityRouter.put("/:id/requests/:reqId", verifyJWT, handleJoinRequest);
communityRouter.post("/:id/invite", verifyJWT, sendInvite);
communityRouter.get("/invite/:token", verifyJWT, acceptInvite);

export default communityRouter;
