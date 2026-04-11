import { Router } from "express";
import { createProject, getExploreProjects, getMyProjects, getProjectById, updateProject, deleteProject } from "../controllers/project.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/",verifyToken, createProject)
router.get("/me", verifyToken, getMyProjects)
router.get("/", verifyToken, getExploreProjects)
router.patch("/:projectId", verifyToken, updateProject)
router.delete("/:projectId", verifyToken, deleteProject)
router.get("/:projectId", verifyToken, getProjectById)
export default router