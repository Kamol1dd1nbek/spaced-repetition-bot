import mongoose from "mongoose";

const repetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  type: { type: String },
  fileId: { type: String },
  body: { type: String },
  bodyText: { type: String },
  step: { type: Number, default: 1 },
  chatId: { type: Number, required: true },
  createdDate: { type: Date, default: Date.now },
  nextRepetition: { type: Date, default: Date.now },
  stability: { type: Number, default: 1 },
  lastReview: { type: Date, default: Date.now },
  lastInterval: { type: Number, default: 10 },
  responseHistory: { type: [Number], default: [] },
  eFactor: { type: Number, default: 2.5 },
  repetitions: { type: Number, default: 0 }  
}, { versionKey: false });

const Repetition = mongoose.model("Repetition", repetitionSchema);

export default Repetition;
