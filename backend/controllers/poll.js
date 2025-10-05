import Poll from "../models/poll.js";
import { sendCookies } from "../utils/sendCookie.js";
import { ErrorHandler } from "../middlewares/error.js";

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, visibility, votingMode, startTime, endTime } = req.body;

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
      options: formattedOptions,
      visibility: visibility || "Public",
      votingMode: votingMode || "Standard",
      creator: new mongoose.Types.ObjectId(creator),
      startTime: Number(startTime),
      endTime: Number(endTime),
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


export const voteInPoll = async (req, res, next) => {
  try {
    const { pollId, optionIndex } = req.body;
    const userId = req.userId;

    const poll = await Poll.findOne({ pollId });
    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    const now = Date.now();
    if (poll.startTime > now || poll.endTime < now) {
      return next(new ErrorHandler("Poll is not active", 400));
    }

    if (poll.voters.includes(userId)) {
      return next(new ErrorHandler("You have already voted", 400));
    }

    // Increment vote count
    poll.options[optionIndex].voteCount += 1;

    // Add user to voters array
    poll.voters.push(userId);

    // Increment total votes
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

    // Fetch all polls that are public and active (within start/end time)
    const polls = await Poll.find({
      visibility: "Public",
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate("creator", "walletAddress") // populate creator's wallet address or name
      .sort({ startTime: -1 }); // latest polls first

    // Format the response
    const formattedPolls = polls.map((poll) => ({
      pollId: poll.pollId,
      question: poll.question,
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      votingMode: poll.votingMode,
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

    const poll = await Poll.findOne({ pollId })
      .populate("creator", "walletAddress"); // fetch creator's wallet address

    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    // Format response
    const formattedPoll = {
      pollId: poll.pollId,
      question: poll.question,
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      votingMode: poll.votingMode,
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
    const userId = req.userId; // From authentication middleware
    if (!userId) return next(new ErrorHandler("User not authenticated", 401));

    // Find all polls created by this user
    const polls = await Poll.find({ creator: userId })
      .populate("creator", "walletAddress") // optional, just to include wallet
      .sort({ startTime: -1 }); // latest polls first

    // Format the response
    const formattedPolls = polls.map((poll) => ({
      pollId: poll.pollId,
      question: poll.question,
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      votingMode: poll.votingMode,
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
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      votingMode: poll.votingMode,
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
    const userId = req.userId; // from auth middleware

    if (!pollId) return next(new ErrorHandler("Poll ID is required", 400));

    const poll = await Poll.findOne({ pollId })
      .populate("creator", "walletAddress"); // get creator info

    if (!poll) return next(new ErrorHandler("Poll not found", 404));

    // Check if the requesting user has already voted
    const hasVoted = userId ? poll.voters.includes(userId) : false;

    // Format response
    const formattedPoll = {
      pollId: poll.pollId,
      question: poll.question,
      img: poll.img,
      options: poll.options.map((opt) => ({
        name: opt.name,
        voteCount: opt.voteCount,
      })),
      visibility: poll.visibility,
      votingMode: poll.votingMode,
      creator: poll.creator ? poll.creator.walletAddress : null,
      startTime: poll.startTime,
      endTime: poll.endTime,
      totalVotes: poll.totalVotes,
      isActive: poll.isActive,
      hasVoted, // extra field to let frontend know
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

