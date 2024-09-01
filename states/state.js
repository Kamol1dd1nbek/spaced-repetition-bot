import { createState } from "../utils/helpers.js";

const currentAction = createState("");
const currentEditingPart = createState({});
const newRepetition = createState({});
const mainMessage = createState({});
const trash = createState([]);
const repetitionsTimes = createState([
  "30 minutes",
  "1 hour",
  "2 hours",
  "3 hours",
  "8 hours",
  "1 day",
  "3 days",
  "7 days",
  "21 days",
  "30 days",
  "45 days",
  "60 days",
  "90 days",
  "120 days",
  "180 days",
]);

export { currentAction, currentEditingPart, newRepetition, trash, mainMessage };
