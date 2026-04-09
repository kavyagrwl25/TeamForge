import { Router } from "express";
import { createProject } from "../controllers/project.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/",verifyToken, createProject);

export default router