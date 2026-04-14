import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createRequest, getRequestsForMyProject } from "../controllers/request.controller.js";

const router = Router();

router.get("/project/:projectId", verifyToken, getRequestsForMyProject)
router.post("/project/:projectId", verifyToken, createRequest)
export default router