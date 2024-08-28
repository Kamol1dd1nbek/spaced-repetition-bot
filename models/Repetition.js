import mongoose from "mongoose";

const repetitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: false },
  body: { type: String, required: true },
  step: { type: Number, default: 1 },
  createdDate: { type: Date, default: Date.now },
  nextRepetition: { type: Date, default: Date.now },
});

const Repetition = mongoose.model("Repetition", repetitionSchema);

export default Repetition;
