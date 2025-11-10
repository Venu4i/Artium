import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleAuth,
  getUser,
  changePassword,
  editProfile
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/refresh", refreshAccessToken);

// Google: accepts { idToken } from frontend
router.post("/google", googleAuth);

// profile
router.get("/me/:id", getUser);
router.patch("/change-password", verifyJWT, changePassword);
router.patch("/edit", verifyJWT, upload.single("profilePicture"), editProfile);

export default router;
