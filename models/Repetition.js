import mongoose from "mongoose";

const repetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  type: { type: String },
  fileId: { type: String },
  bodyText: { type: String },
  step: { type: Number, default: 1 },
  chatId: { type: Number, required: true },
  createdDate: { type: Date, default: Date.now },
  nextRepetition: { type: Date, default: Date.now },
});

const Repetition = mongoose.model("Repetition", repetitionSchema);

export default Repetition;
