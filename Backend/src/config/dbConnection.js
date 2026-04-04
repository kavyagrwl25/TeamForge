import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export default connectDb;