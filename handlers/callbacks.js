import Repetition from "../models/Repetition.js";
import { newRepetition } from "../states/state.js";
import { sendMessage } from "../utils/helpers.js";

export default async function onCallbackQuery(callbackQuery) {
  let data = callbackQuery.data;
  console.log(data);

  switch (data) {
    case "cencel_adding":
      newRepetition.setState(() => {});
      break;
    case "edit_adding":
      // newRepetition.setState(() => {});
      break;
    case "confirm_adding":
      console.log(await newRepetition.getState());
      
      await new Repetition(await newRepetition.getState()).save();
      sendMessage("Saved")
      newRepetition.setState(() => {});
      break;
  }
}
