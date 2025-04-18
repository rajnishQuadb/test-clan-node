import mongoose from "mongoose";
import "dotenv/config.js";

async function connectDB() {
    try {
        const URI = process.env.URI;
        if (!URI) {
            throw new Error("MongoDB connection URI is not defined in environment variables");
        }
        
        console.log("Connecting to MongoDB...");
        await mongoose.connect(URI);
        console.log("Connected to MongoDB successfully");
        return true;
    } catch (error) {
        // Now the error parameter is properly defined in the catch block
        console.error("Error connecting to MongoDB:", error);
        throw error; // Re-throw the error so the caller knows something went wrong
    }
}

export default connectDB;