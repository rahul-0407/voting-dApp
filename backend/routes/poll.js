import express from "express";
import {createPoll,voteInPoll,getAllPublicPolls,getPollById,getPollCreatedByUser,getUserVotedPoll,  getPollDetail} from "../controllers/poll.js"
import upload from "../middlewares/multer.js"
import { authenticateUser } from '../middlewares/auth.js';

const pollRouter  = express.Router();

pollRouter.post("/createPoll", createPoll);
pollRouter.post("/voteInPoll", voteInPoll);
pollRouter.get("/allPublicPolls", getAllPublicPolls)
pollRouter.get("privatePollById/:id", getPollById);
pollRouter.get("/getCreatedPoll", getPollCreatedByUser);
pollRouter.get("getVotedPoll", getUserVotedPoll);
pollRouter.get("pollDetail",getPollDetail);

export default pollRouter;