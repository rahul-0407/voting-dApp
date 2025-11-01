import express, {json} from "express";
import "dotenv/config";
import cors from "cors";
import cron from "node-cron";
import authRoutes from './routes/authRoutes.js';
import pollRouter from "./routes/poll.js"
import Poll from "./model/poll.js";
import {errorMiddleware} from "./middleware/error.js"
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

app.use("/api/auth/v1",authRoutes)
app.use("/api/poll/v1",pollRouter)

app.get("/", (req, res) => {
  res.send("Working");
});



// app.post('/api/can-vote', async (req, res) => {
//     const { pollId, userAddress } = req.body;
    
//     // Check your database for private poll permissions
//     // This is where you handle the allowed voters logic
//     const isAllowed = await checkPrivatePollAccess(pollId, userAddress);
    
//     res.json({ canVote: isAllowed });
// });

// async function checkPrivatePollAccess(pollId, userAddress) {
//     // TODO: Implement your database logic
//     // For now, return true
//     return true;
// }


app.use(errorMiddleware);




export default app;