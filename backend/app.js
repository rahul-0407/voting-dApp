import express, {json} from "express";
import "dotenv/config";
import cors from "cors";
import {errorMiddleware} from "./middlewares/error.js"
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = ['http://localhost:5173','https://identity3.vercel.app','https://identity-zksync-1.onrender.com']

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin:function(origin,callback){
        if(!origin) return callback(null, true);

        if(allowedOrigins.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error ("Not allowed by CORS"));
        }
    },
    credentials:true,
}))

app.get("/", (req, res) => {
  res.send("Working");
});


app.use(errorMiddleware);

export default app;