import express from "express"
import cookieParser, { signedCookie } from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))
app.use(cookieParser());

//importing routes
import userRouter from "./routes/user.routes.js"

/* Routes declaration
api/v1/users is a prefix for routes
After using this we don't have to declare base route again and again
*/
app.use("/api/v1/users", userRouter);

export default app;