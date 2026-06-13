import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleAuth,
  getUser,
  changePassword,
  editProfile,
  getUserProfile,
  toggleFollowUser,
  getGlobalLeaderboard,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import upload from "../middlewares/upload.js"; 

const router = express.Router();
// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/refresh", refreshAccessToken);
router.post("/refresh", refreshAccessToken); // frontend sends refreshToken in body
router.post("/google", googleAuth);

router.get("/profile", verifyJWT, getUserProfile);
router.get("/leaderboard", verifyJWT, getGlobalLeaderboard);
router.post("/:userId/follow", verifyJWT, toggleFollowUser);
router.get("/me/:id", getUser);
router.patch("/change-password", verifyJWT, changePassword);
router.patch("/edit", verifyJWT, upload.fields([
  { name: 'avatar', maxCount: 1 },     
  { name: 'coverImage', maxCount: 1 }  
]), editProfile);

export default router;
