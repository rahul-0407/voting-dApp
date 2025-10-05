import express from "express";
import {createPoll,voteInPoll,getAllPublicPolls,getPollById,getPollCreatedByUser,getUserVotedPoll,  getPollDetail} from "../controllers/poll.js"
import upload from "../middleware/multer.js"
import { authenticateUser } from '../middleware/auth.js';

const pollRouter  = express.Router();

pollRouter.post("/createPoll",authenticateUser, upload.fields([{name:'image0', maxCount:1}]),createPoll);
pollRouter.post("/voteInPoll", voteInPoll);
pollRouter.get("/allPublicPolls", getAllPublicPolls)
pollRouter.get("privatePollById/:id", getPollById);
pollRouter.get("/getCreatedPoll", getPollCreatedByUser);
pollRouter.get("getVotedPoll", getUserVotedPoll);
pollRouter.get("pollDetail",getPollDetail);

export default pollRouter;