import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { initSocket, addUserSocket, removeUserSocket } from "./socket.js";
import connectDb from "./config/dbConnection.js";

const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

const startServer = async () => {
  try {
    await connectDb();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    initSocket(io);

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

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();