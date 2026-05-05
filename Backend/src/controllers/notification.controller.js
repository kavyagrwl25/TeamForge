import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";

const getMyNotifications = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ recipient: userId })
    .populate("sender", "fullName userName email")
    .populate(
      "data.projectId",
      "title description techStack rolesNeeded projectType status"
    )
    .populate("data.requestId")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const markNotificationAsRead = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: { isRead: true },
    },
    {
      new: true,
    }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

const markAllNotificationsAsRead = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: { isRead: true },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

export {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
