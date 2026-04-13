import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requested user is required"],
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },

    pitchMessage: {
      type: String,
      trim: true,
      maxlength: [300, "Message cannot exceed 300 characters"],
      default: "Hey, I am interested!",
    },

    roleRequested: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// prevent same user from sending multiple requests to same project
requestSchema.index({ requestedBy: 1, project: 1 }, { unique: true });

export const Request = mongoose.model("Request", requestSchema);