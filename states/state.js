import { createContext, createState } from "../utils/helpers.js";
const context = createContext();
const repetitionsTimes = createState([
  "10 minute",
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

export { repetitionsTimes, context };
