import dotenv from "dotenv"
dotenv.config()
import app from "./app.js"
import connectDb from "./config/dbConnection.js"

const PORT = process.env.PORT || 4000

const startServer = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch(err){
        console.log("MongoDb connection failed:", err)
        process.exit(1)
    }
}

startServer();