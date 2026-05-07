import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", verifyToken, getMyNotifications);
router.patch("/:notificationId/read", verifyToken, markNotificationAsRead);
router.patch("/read-all", verifyToken, markAllNotificationsAsRead);

export default router; 