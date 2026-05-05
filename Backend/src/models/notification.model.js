import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["NEW_REQUEST", "REQUEST_STATUS_UPDATED"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    data: {
      requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request",
      },
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔥 index for fast queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);