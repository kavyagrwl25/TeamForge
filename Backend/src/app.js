import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import requestRoutes from "./routes/request.routes.js";

const app = express();

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));               // limit request body to 16kb to prevent abuse
app.use(express.urlencoded({ extended: true, limit: "16kb" }));     // parse urlencoded bodies with a limit of 16kb
app.use(express.static("public"));          // serve static files from the "public" directory
app.use(cookieParser());                // parse cookies from incoming requests

// health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// api routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/requests", requestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;