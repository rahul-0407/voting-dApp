import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true, index: true },
  img: { type: String, required: true },
  question: { type: String, required: true },
  description: { type: String, required: true }, // ✅ added description
  options: { type: [optionSchema], required: true },
  visibility: {
    type: String,
    enum: ["Public", "Private"],
    default: "Public",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  nullifiers: [{ type: String }],
});

export default mongoose.model("Poll", pollSchema);
