import { bot } from "../bot.js";
import editMessageText from "../modules/editMessageText.js";
import sendMessage from "../modules/sendMessage.js";
import { currentAction, newRepetition, trash } from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
  formatText,
} from "../utils/helpers.js";

export default async function onMessage(msg) {
  await trash.setState((prev) => [
    ...prev,
    { chat_id: msg.chat.id, message_id: msg.message_id },
  ]);
  let newRepData = await newRepetition.getState();
  const chatId = msg.chat.id;
  let text = msg?.text;
  await clearTrash();

  switch (currentAction.getState()) {
    case "addTitle":
      if (text.trim() === "") {
        return sendMessage("⚠️ Title cannot be empty", chatId);
      }
      newRepetition.setState((prev) => {
        return { ...prev, title: formatText(text) };
      });
      sendMessage("🖋️ Please enter the SUBTITLE : ", chatId, {
        ...createInlineKeyboard([
          [{ text: "Cencel", callback_data: "cencel_adding" }],
        ]),
      });
      currentAction.setState(() => "addSubtitle");
      break;

    case "addSubtitle":
      if (text !== ".") {
        newRepetition.setState((prev) => {
          return { ...prev, subtitle: formatText(text) };
        });
      }
      sendMessage("📜 Please enter the BODY :", chatId, {
        ...createInlineKeyboard([
          [{ text: "Cencel", callback_data: "cencel_adding" }],
        ]),
      });
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
        chatId,
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
