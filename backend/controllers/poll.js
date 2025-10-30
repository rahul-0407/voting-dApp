import Poll from "../model/poll.js";
import { sendCookies } from "../utils/sendCookie.js";
import { ErrorHandler } from "../middleware/error.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const createPoll = async (req, res, next) => {
  try {
    const { question, description, options, visibility, startTime, endTime } = req.body;

    const creator = req.userId;
    if (!creator) return next(new ErrorHandler("User not authenticated", 401));

    if (!question || !options || options.length < 2) {
      return next(
        new ErrorHandler("A poll must have a question and at least 2 options.", 400)
      );
    }

    const parsedOptions = typeof options === "string" ? JSON.parse(options) : options;

    const formattedOptions = parsedOptions.map((opt) => ({
      name: typeof opt === "string" ? opt : opt.name,
      voteCount: 0,
    }));

    if (!req.files || !req.files.image0) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const file = req.files.image0[0];

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    const imageUrl = result.secure_url;

    const pollId = "poll_" + Date.now().toString(36);

    const newPoll = new Poll({
      pollId,
      img: imageUrl,
      question,
      description, // ✅ added
      options: formattedOptions,
      visibility: visibility || "Public",
      creator: new mongoose.Types.ObjectId(creator),
      startTime: Number(startTime),
      endTime: Number(endTime),
      isActive: true,
      totalVotes: 0,
    });

    await newPoll.save();

    return res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: newPoll,
      imageUrl,
    });

  } catch (error) {
    console.error("Create Poll Error:", error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const voteInPollAnonymous = async (req, res, next) => {
  try {
    const { pollId, optionIndex, proof, nullifier, publicSignals } = req.body;
    const userId = req.userId;
    if (!userId) return next(new ErrorHandler("User not authenticated", 401));

    const poll = await Poll.findOne({ pollId });
    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    const now = Date.now();
    if (poll.startTime > now || poll.endTime < now) {
      return next(new ErrorHandler("Poll is not active", 400));
    }

    // ✅ Check if this nullifier already exists
    if (poll.nullifiers.includes(nullifier)) {
      return next(new ErrorHandler("This vote has already been cast (nullifier exists)", 400));
    }

    console.log("🔐 ZK Proof received:", { proof, publicSignals, nullifier });

    poll.options[optionIndex].voteCount += 1;
    poll.nullifiers.push(nullifier);
    poll.totalVotes += 1;

    await poll.save();

    return res.status(200).json({
      success: true,
      message: "Anonymous vote recorded successfully",
      poll: {
        pollId: poll.pollId,
        totalVotes: poll.totalVotes,
      },
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const voteInPoll = async (req, res, next) => {
  try {
    const { pollId, optionIndex } = req.body;
    const userId = req.userId;
    console.log(userId);

    const poll = await Poll.findOne({ pollId });
    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    const now = Date.now();
    if (poll.startTime > now || poll.endTime < now) {
      return next(new ErrorHandler("Poll is not active", 404));
    }

    if (poll.voters.includes(userId)) {
      return next(new ErrorHandler("You have already voted", 400));
    }

    poll.options[optionIndex].voteCount += 1;
    poll.voters.push(userId);
    poll.totalVotes += 1;

    await poll.save();

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      poll,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getAllPublicPolls = async (req, res, next) => {
  try {
    const now = Date.now();

    const polls = await Poll.find({
      visibility: "Public",
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate("creator", "walletAddress")
      .sort({ startTime: -1 });

    const formattedPolls = polls.map((poll) => ({
      pollId: poll.pollId,
      question: poll.question,
      description: poll.description, // ✅ added
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
    }));

    return res.status(200).json({
      success: true,
      polls: formattedPolls,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    if (!pollId) return next(new ErrorHandler("Poll ID is required", 400));

    const poll = await Poll.findOne({ pollId }).populate("creator", "walletAddress");
    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    const formattedPoll = {
      pollId: poll.pollId,
      question: poll.question,
      description: poll.description, // ✅ added
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
    };

    return res.status(200).json({
      success: true,
      poll: formattedPoll,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollCreatedByUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return next(new ErrorHandler("User not authenticated", 401));

    const polls = await Poll.find({ creator: userId })
      .populate("creator", "walletAddress")
      .sort({ startTime: -1 });

    const formattedPolls = polls.map((poll) => ({
      pollId: poll.pollId,
      question: poll.question,
      description: poll.description, // ✅ added
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
    }));

    return res.status(200).json({
      success: true,
      polls: formattedPolls,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getUserVotedPoll = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return next(new ErrorHandler("User not authenticated", 401));

    const polls = await Poll.find({ voters: userId })
      .populate("creator", "walletAddress")
      .sort({ startTime: -1 });

    const formattedPolls = polls.map((poll) => ({
      pollId: poll.pollId,
      question: poll.question,
      description: poll.description, // ✅ added
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
    }));

    return res.status(200).json({
      success: true,
      polls: formattedPolls,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollDetail = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const userId = req.userId;

    if (!pollId) return next(new ErrorHandler("Poll ID is required", 400));

    const poll = await Poll.findOne({ pollId }).populate("creator", "walletAddress");
    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    const hasVoted = userId ? poll.voters.includes(userId) : false;

    const formattedPoll = {
      pollId: poll.pollId,
      question: poll.question,
      description: poll.description, // ✅ added
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
      hasVoted,
    };

    return res.status(200).json({
      success: true,
      poll: formattedPoll,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};
