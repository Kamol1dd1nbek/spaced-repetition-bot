import { bot } from "../bot.js";
import editMessageText from "../modules/editMessageText.js";
import sendMessage from "../modules/sendMessage.js";
import {
  currentAction,
  currentEditingPart,
  newRepetition,
  trash,
} from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
  formatText,
} from "../utils/helpers.js";
// TODO: clean also here
export default async function onMessage(msg) {
  await trash.setState((prev) => [
    ...prev,
    { chat_id: msg.chat.id, message_id: msg.message_id },
  ]);
  let newRepData = await newRepetition.getState();
  const chatId = msg.chat.id;
  let text = msg?.text;

  switch (text) {
    case "➕ Add new":
      await clearTrash();
      sendMessage(chatId, "📌 Please enter the *TITLE* :");
      return currentAction.setState(() => "addTitle");
  }

  switch (currentAction.getState()) {
    case "addTitle":
      if (text.trim() === "") {
        return sendMessage(chatId, "⚠️ Title cannot be empty");
      }
      newRepetition.setState((prev) => {
        return { ...prev, title: formatText(text) };
      });
      await clearTrash();
      sendMessage(chatId, "🖋️ Please enter the *SUBTITLE* : ");
      currentAction.setState(() => "addSubtitle");
      break;

    case "addSubtitle":
      if (text !== ".") {
        newRepetition.setState((prev) => {
          return { ...prev, subtitle: formatText(text) };
        });
      }
      await clearTrash();
      sendMessage(chatId, "📜 Please enter the *BODY* :");
      currentAction.setState(() => "addBody");
      break;

    case "addBody":
      if (text.trim() === "") {
        return sendMessage(chatId, "⚠️ Body cannot be empty");
      }
      newRepetition.setState(async (prev) => {
        return { ...prev, body: formatText(text, false) };
      });
      await clearTrash();
      sendMessage(
        chatId,
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
          ...createKeyboard([["Add"]]),
          ...createInlineKeyboard([
            [
              { text: "❌ Cencel", callback_data: "cencel_adding" },
              {
                text: "✏️ Edit",
                web_app: { url: "https://github.com/Kamol1dd1nbek" },
              },
              { text: "✅ Confirm", callback_data: "confirm_adding" },
            ],
          ]),
        }
      );
      currentAction.setState(() => "checkNewRep");
      break;
  }
}
