import Poll from "../models/poll.js";
import { sendCookies } from "../utils/sendCookie.js";
import { ErrorHandler } from "../middlewares/error.js";

export const createPoll = async (req, res, next) => {
  try {
    const { question, options, visibility, votingMode, startTime, endTime } =
      req.body;

    // The creator is already authenticated (like your upload function)
    const creator = req.userId; // from JWT or middleware
    if (!creator) return next(new ErrorHandler("User not authenticated", 401));

    // Validate fields
    if (!question || !options || options.length < 2) {
      return next(
        new ErrorHandler(
          "A poll must have a question and at least 2 options.",
          400
        )
      );
    }

    const parsedOptions = typeof options === "string" ? JSON.parse(options) : options;

    if (!req.files || !req.files.image0)
      return next(new ErrorHandler("No file uploaded", 400));

    const file = req.files.image0[0];

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto", // 'auto' for PDFs, images, etc.
    });

    const pollId = "poll_" + Date.now().toString(36);

    const newPoll = new Poll({
      pollId,
      question,
      options: parsedOptions.map((opt) => ({
        name: opt.name || opt,
        voteCount: 0,
      })),
      visibility: visibility || "Public",
      votingMode: votingMode || "Standard",
      creator,
      startTime: Number(startTime),
      endTime: Number(endTime),
      totalVotes: 0,
    });

    await newPoll.save();

    return res.json({
      success: true,
      message: "Poll created successfully",
      poll: newPoll,
      imageUrl,
    });


  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Failed to perform task", 500));
  }
};

export const voteInPoll = async (req, res, next) => {
  try {
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
