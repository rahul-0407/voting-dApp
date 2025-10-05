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
    console.log("hoi")
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getAllPublicPolls = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollById = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollCreatedByUser = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getUserVotedPoll = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const getPollDetail = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};
