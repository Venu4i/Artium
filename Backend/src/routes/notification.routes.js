import express from "express";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/:userId", getNotifications);
router.patch("/:notifId/read", markAsRead);

export default router;
