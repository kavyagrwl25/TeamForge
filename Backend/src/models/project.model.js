import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },

    techStack: {
      type: [String],
      default: [],
    },

    rolesNeeded: {
      type: [String], // e.g. ["Frontend", "Backend", "ML"]
      default: [],
    },

    projectType: {
      type: String,
      enum: ["personal", "startup", "hackathon", "open-source"],
      default: "personal",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    repoLink: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);