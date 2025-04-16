import mongoose from "mongoose";
import "dotenv/config.js";

async function connectDB(){
    try{
        const URI = process.env.URI
        if(URI != undefined){
            console.log(URI);
            await mongoose.connect(URI);
            console.log("Connected to MongoDB");
        }
    } catch{
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;