import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { initSocket, addUserSocket, removeUserSocket } from "./socket.js";
import connectDb from "./config/dbConnection.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDb();

    // Create HTTP server using Express app
    const server = http.createServer(app);

    // Attach Socket.IO to HTTP server
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
      },
    });

    // Store io globally
    initSocket(io);

    // Handle socket connections
    io.on("connection", (socket) => {
      const userId = socket.handshake.auth?.userId;

      if (userId) {
        addUserSocket(userId, socket.id);
        console.log("User connected:", userId, socket.id);
      }

      socket.on("disconnect", () => {
        if (userId) {
          removeUserSocket(userId);
          console.log("User disconnected:", userId);
        }
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("MongoDb connection failed:", err);
    process.exit(1);
  }
};

startServer();