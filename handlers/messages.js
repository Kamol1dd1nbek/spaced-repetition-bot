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

  switch (text) {
    case "➕ Add new":
      currentAction.setState(() => "addTitle");
      return sendMessage("📌 Please enter the *TITLE* :");
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
      newRepetition.setState(async (prev) => {
        return { ...prev, body: await formatText(text, false) };
      });
      await clearTrash();
      let keyboards = createInlineKeyboard([
        [
          { text: "❌ Cencel", callback_data: "cencel_adding" },
          { text: "✅ Confirm", callback_data: "confirm_adding" },
        ],
      ]);
      let newRepData = await newRepetition.getState();
      sendMessage(
        `
📋 Please confirm the details you have provided:

📌 Title: *${newRepData.title}*
${
  newRepData.subtitle !== undefined
    ? `\n🖋️ Subtitle: ${newRepData.subtitle}\n`
    : ""
}
📜 Body:\n
${newRepData.body}
`,
        {
          ...createInlineKeyboard([
            [
              { text: "❌ Cencel", callback_data: "cencel_adding" },
              { text: "✅ Confirm", callback_data: "confirm_adding" },
            ],
          ]),
        }
      );
      break;
  }
}
