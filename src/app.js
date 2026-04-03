import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoutes from "./routes/user.routes.js"
import projectRoutes from "./routes/project.routes.js"
import requestRoutes from "./routes/request.routes.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))  // Parse JSON bodies with a limit of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // Parse URL-encoded bodies with a limit of 16kb
app.use(express.static("public"))           // Serve static files from the "public" directory
app.use(cookieParser())         // Parse cookies from incoming requests

// routes will be added here in the future

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/projects", projectRoutes)
app.use("/api/v1/requests", requestRoutes)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        data: null,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    })
})

export default app