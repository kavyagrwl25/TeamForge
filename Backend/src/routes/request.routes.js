import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { createRequest } from "../controllers/request.controller.js";

const router = Router();

router.post("/:projectId", verifyToken, createRequest)

export default router