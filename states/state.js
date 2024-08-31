import { createState } from "../utils/helpers.js";

const currentAction = createState("");
const currentEditingPart = createState({});
const newRepetition = createState({});
const trash = createState([]);

export { currentAction, currentEditingPart, newRepetition, trash };
