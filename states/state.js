import { createState } from "../utils/helpers.js";

const currentAction = createState("");
const newRepetition = createState({});
const trash = createState([]);

export { currentAction, newRepetition, trash };
