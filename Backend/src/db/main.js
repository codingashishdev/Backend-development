import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
import { constrainedMemory } from "process";

const DBConnect = async () => {
    try {
        const URI = process.env.MONGODB_URI;
        const connectionInstance = await mongoose.connect(`${URI}/${DB_NAME}`)
        console.log(`MongoDB Connected DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("ERROR: ", error);
        process.exit(1)
    }
}

export default DBConnect;