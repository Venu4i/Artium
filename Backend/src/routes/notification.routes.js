import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/read-all").patch(markAllAsRead);
router.route("/:notificationId/read").patch(markAsRead);

export default router;
