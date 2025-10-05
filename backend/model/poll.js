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
  img:{type:String, required:true},
  question: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  visibility: {
    type: String,
    enum: ["Public", "Private"],
    default: "Public",
  },
  votingMode: {
    type: String,
    enum: ["Standard", "Anonymous"],
    default: "Standard",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: UserActivation,
    required: true,
  },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: UserActivation }],
});

export default mongoose.model("Poll", pollSchema);
