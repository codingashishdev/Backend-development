import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const DBConnect = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB Connected || DB Host: ${connectionInstance}`);
    } catch (error) {
        console.log("ERROR: ", error);
        // process.exit(1)
    }
}

DBConnect();