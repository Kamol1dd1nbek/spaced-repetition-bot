import mongoose from "mongoose";

const repetitionSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  type: { type: String },
  fileId: { type: String },
  body: { type: String },
  bodyText: { type: String },
  // step: { type: Number, default: 1 },
  // stability: { type: Number, default: 1 },
  // lastReview: { type: Date, default: Date.now },
  // lastInterval: { type: Number, default: 10 },
  // responseHistory: { type: [Number], default: [] },
  interval: { type: Number, default: 1 },
  eFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 },
  nextRepetition: { type: Date, default: Date.now },
  createdDate: { type: Date, default: Date.now },
}, { versionKey: false });

const Repetition = mongoose.model("Repetition", repetitionSchema);

export default Repetition;
