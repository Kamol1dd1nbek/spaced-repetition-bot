import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  username: { type: String, required: true },
  mainMessage: { type: Object, default: {} },
  isFormated: { type: Boolean, default: false },
  currentAction: { type: String, default: "" },
  isRepetitioning: { type: Boolean, default: false },
  timeoutId: { type: String },
  newRepetition: { type: Object, default: {} },
  trash: { type: Array, default: [] },
  pagination: { type: Object, default: { currentPage: 1 } },
  createdDate: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
