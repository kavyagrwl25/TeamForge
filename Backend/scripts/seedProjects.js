import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDb from "../src/config/dbConnection.js";
import { Project } from "../src/models/project.model.js";
import { User } from "../src/models/user.model.js";

dotenv.config();

const shouldClearExistingProjects = process.argv.includes("--clear");

const projectSeeds = [
  {
    title: "Campus Connect Marketplace",
    description:
      "A student collaboration platform for sharing notes, forming study groups, and tracking campus events in one place.",
    techStack: ["React", "Node.js", "MongoDB"],
    rolesNeeded: ["Frontend Developer", "Backend Developer", "UI Designer"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/campus-connect-marketplace",
  },
  {
    title: "AI Resume Reviewer",
    description:
      "A smart web app that analyzes resumes, highlights gaps, and suggests practical improvements for tech roles.",
    techStack: ["Next.js", "Express", "OpenAI API"],
    rolesNeeded: ["Full Stack Developer", "Prompt Engineer"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/ai-resume-reviewer",
  },
  {
    title: "Hackathon Team Matcher",
    description:
      "A matching platform that helps hackathon participants find teammates based on skills, interests, and availability.",
    techStack: ["React", "Firebase", "Tailwind CSS"],
    rolesNeeded: ["Frontend Developer", "Product Designer"],
    projectType: "hackathon",
    repoLink: "https://github.com/demo-team/hackathon-team-matcher",
  },
  {
    title: "Open Source Issue Radar",
    description:
      "A dashboard that curates beginner-friendly GitHub issues and helps contributors track progress across repositories.",
    techStack: ["Vue", "Node.js", "GitHub API"],
    rolesNeeded: ["Backend Developer", "Frontend Developer"],
    projectType: "open-source",
    repoLink: "https://github.com/demo-team/open-source-issue-radar",
  },
  {
    title: "Local Volunteer Hub",
    description:
      "A platform connecting volunteers with nearby NGOs, community drives, and social impact campaigns.",
    techStack: ["React", "Express", "MongoDB"],
    rolesNeeded: ["Frontend Developer", "Backend Developer", "QA Tester"],
    projectType: "personal",
    repoLink: "https://github.com/demo-team/local-volunteer-hub",
  },
  {
    title: "Freelancer Invoice Tracker",
    description:
      "A productivity tool for freelancers to generate invoices, manage clients, and monitor payment history.",
    techStack: ["React", "Node.js", "Postman"],
    rolesNeeded: ["Frontend Developer", "Backend Developer"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/freelancer-invoice-tracker",
  },
  {
    title: "Neighborhood Skill Exchange",
    description:
      "A community app where people can offer and request skills like tutoring, design help, or mentoring.",
    techStack: ["MERN", "Socket.io", "JWT"],
    rolesNeeded: ["Full Stack Developer", "Community Manager"],
    projectType: "personal",
    repoLink: "https://github.com/demo-team/neighborhood-skill-exchange",
  },
  {
    title: "Mental Wellness Journal",
    description:
      "A private journaling app with mood tracking, streaks, and lightweight analytics for personal wellness habits.",
    techStack: ["React", "Node.js", "Chart.js"],
    rolesNeeded: ["Frontend Developer", "Backend Developer", "UI Designer"],
    projectType: "personal",
    repoLink: "https://github.com/demo-team/mental-wellness-journal",
  },
  {
    title: "GreenRoute Planner",
    description:
      "A route planning tool that estimates lower-emission travel choices for daily commuting and city exploration.",
    techStack: ["React", "Mapbox", "Express"],
    rolesNeeded: ["Frontend Developer", "Backend Developer"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/greenroute-planner",
  },
  {
    title: "Startup Landing Page Builder",
    description:
      "A drag-and-drop builder for early-stage founders to create polished landing pages without writing code.",
    techStack: ["Next.js", "Node.js", "MongoDB"],
    rolesNeeded: ["Frontend Developer", "UX Designer", "Backend Developer"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/startup-landing-page-builder",
  },
  {
    title: "Code Interview Prep Arena",
    description:
      "A coding practice space with challenge sets, peer review, and progress tracking for interview preparation.",
    techStack: ["React", "Express", "MongoDB"],
    rolesNeeded: ["Frontend Developer", "Backend Developer", "Content Writer"],
    projectType: "open-source",
    repoLink: "https://github.com/demo-team/code-interview-prep-arena",
  },
  {
    title: "Event Budget Splitter",
    description:
      "A collaborative expense manager for trips, college events, and group activities with transparent cost sharing.",
    techStack: ["React", "Node.js", "MongoDB"],
    rolesNeeded: ["Full Stack Developer", "QA Tester"],
    projectType: "personal",
    repoLink: "https://github.com/demo-team/event-budget-splitter",
  },
  {
    title: "Remote Internship Board",
    description:
      "A curated internship listing board focused on remote opportunities for students and early-career developers.",
    techStack: ["React", "Express", "MongoDB"],
    rolesNeeded: ["Backend Developer", "Frontend Developer", "Data Curator"],
    projectType: "startup",
    repoLink: "https://github.com/demo-team/remote-internship-board",
  },
  {
    title: "Peer Learning Circles",
    description:
      "A platform for small accountability groups to schedule sessions, share goals, and review weekly progress.",
    techStack: ["Vue", "Firebase", "Tailwind CSS"],
    rolesNeeded: ["Frontend Developer", "Product Designer"],
    projectType: "personal",
    repoLink: "https://github.com/demo-team/peer-learning-circles",
  },
  {
    title: "Civic Feedback Portal",
    description:
      "An open-source portal for residents to report civic issues, suggest improvements, and track local responses.",
    techStack: ["React", "Node.js", "MongoDB"],
    rolesNeeded: ["Frontend Developer", "Backend Developer", "Open Source Maintainer"],
    projectType: "open-source",
    repoLink: "https://github.com/demo-team/civic-feedback-portal",
  },
];

const main = async () => {
  try {
    await connectDb();

    const existingUser = await User.findOne().select("_id fullName userName email").lean();

    if (!existingUser) {
      throw new Error("No users found in the database. Create a user before seeding projects.");
    }

    if (shouldClearExistingProjects) {
      const deleteResult = await Project.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing projects before seeding.`);
    }

    const projectsToInsert = projectSeeds.map((project) => ({
      ...project,
      status: "open",
      createdBy: existingUser._id,
    }));

    const insertedProjects = await Project.insertMany(projectsToInsert);

    console.log(
      `Seeded ${insertedProjects.length} test projects using user ${existingUser.userName || existingUser.email}.`
    );
    console.log(`Projects inserted: ${insertedProjects.length}`);
  } catch (error) {
    console.error("Project seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

main();
