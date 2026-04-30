import dotenv from "dotenv"
dotenv.config()
import http from "http"
import app from "./app.js"
import { Server } from "socket.io"
import connectDb from "./config/dbConnection.js"

const PORT = process.env.PORT || 4000

const startServer = async () => {
    try {
        await connectDb();
        const server = http.createServer(app)  // create an HTTP server using the Express app
        const io = new Server(server, {     // create a new Socket.IO server and attach it to the HTTP server
            cors: {
                origin: process.env.CORS_ORIGIN,
                credentials: true
            }
        })
        io.on("connection", (socket) => {           // listen for new socket connections(why io.on and not socket.on? because we want to listen for connections on the server, not on the individual socket)
            console.log("Socket connected:", socket.id);
            socket.emit("welcome", {
                message: "Welcome to TeamForge realtime server",
            });
            socket.on("disconnect", () => {         // listen for socket disconnections(why socket.on and not io.on? because we want to listen for disconnections on the individual socket, not on the server)
                console.log("Socket disconnected:", socket.id);
            });
        });
        server.listen(PORT, () => {     
            console.log(`Server running on port ${PORT}`)
        })
    } catch(err){
        console.log("MongoDb connection failed:", err)
        process.exit(1)
    }
}

startServer();