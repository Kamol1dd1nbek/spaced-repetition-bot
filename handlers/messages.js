import { bot } from "../bot.js";
import { currentAction, newRepetition, trash } from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  formatText,
  sendMessage,
} from "../utils/helpers.js";

export default async function onMessage(msg) {
  trash.setState((prev) => [...prev, msg.message_id]);
  let text = msg?.text;

  //   console.log(await formatText(`
  //   .ol
  //   .li First item .li Second item .li Third item
  //   .ol
  // `))
  // return sendMessage(await formatText(".ol .li piyoz .li kartoshka .\/ol"))

  switch (text) {
    case "➕ Add new":
      currentAction.setState(() => "addTitle");
      return sendMessage("📌 Please enter the *TITLE* :");
      break;
  }

  switch (currentAction.getState()) {
    case "addTitle":
      if (text.trim() === "") {
        return sendMessage("⚠️ Title cannot be empty");
      }
      currentAction.setState(() => "addSubtitle");
      newRepetition.setState((prev) => {
        return { ...prev, title: text };
      });
      sendMessage("🖋️ Please enter the *SUBTITLE* : ");
      break;
    case "addSubtitle":
      if (text !== ".") {
        newRepetition.setState((prev) => {
          return { ...prev, subtitle: text };
        });
      }
      currentAction.setState(() => "addBody");
      sendMessage("📜 Please enter the *BODY* :");
      break;
    case "addBody":
      if (text.trim() === "") {
        return sendMessage("⚠️ Body cannot be empty");
      }
      currentAction.setState(() => "checkNewRep");
      newRepetition.setState((prev) => {
        return { ...prev, body: text };
      });
      console.log(newRepetition.getState());
      // console.log(
      //   ...createInlineKeyboard([
      //     { text: "❌ Cencel", callback_data: "cencel_adding" },
      //     { text: "✅ Confirm", callback_data: "confirm_adding" },
      //   ])
      // );
      await clearTrash();
      sendMessage(JSON.stringify(newRepetition), {
        parse_mode: "HTML",
      });
      break;
  }
}
