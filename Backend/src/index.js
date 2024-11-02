// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import DBConnect from "./db/main.js";
import app from "./app.js";

dotenv.config({
    path: "./env"
});

DBConnect()
    .then(() => {
        app.on("error", (err) => {
            console.error("ERROR: ", err)
            throw err
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`server is running on ${process.env.PORT}`)
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection failed", error);
    })




/*
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("ERROR: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log("Listening to port: ", process.env.PORT);
        })
    } catch (error) {
        console.error('Error');
        throw error;
    }
})();
*/
