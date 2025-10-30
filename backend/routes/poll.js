import express from "express";
import {createPoll,voteInPoll,getAllPublicPolls,getPollById,getPollCreatedByUser,getUserVotedPoll,  getPollDetail, voteInPollAnonymous} from "../controllers/poll.js"
import upload from "../middleware/multer.js"
import { authenticateUser } from '../middleware/auth.js';

const pollRouter  = express.Router();

pollRouter.post("/createPoll",authenticateUser, upload.fields([{name:'image0', maxCount:1}]),createPoll);
pollRouter.post("/voteInPoll",authenticateUser, voteInPoll);
// pollRouter.post("/vote-anonymous", authenticateUser, voteInPollAnonymous);
pollRouter.get("/allPublicPolls", getAllPublicPolls)
// pollRouter.get("/privatePollById/:pollId", getPollById);
pollRouter.get("/getCreatedPoll",authenticateUser, getPollCreatedByUser);
pollRouter.get("/getVotedPoll",authenticateUser, getUserVotedPoll);
pollRouter.get("/pollDetail/:pollId",authenticateUser,getPollDetail);

export default pollRouter;