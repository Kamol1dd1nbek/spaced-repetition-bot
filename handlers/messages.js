import sendMessage from "../modules/sendMessage.js";
import { context } from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
  formatText,
} from "../utils/helpers.js";

export default async function onMessage(msg) {
  const chatId = msg.chat.id;
  let text = msg?.text;

  await context.setContext(chatId, "trash", (trash) => [
    ...trash,
    { chat_id: chatId, message_id: msg.message_id },
  ]);
  let newRepData = await context.getContext(chatId, "newRepetition");

  switch (await context.getContext(chatId, "currentAction")) {
    case "addTitle":
      if (text.trim() === "") {
        return sendMessage("⚠️ Title cannot be empty", chatId);
      }
      await context.setContext(chatId, "newRepetition", (prevRepetition) => {
        return { ...prevRepetition, title: formatText(text), chatId };
      });
      sendMessage("🖋️ Please enter the SUBTITLE ", chatId, {
        ...createInlineKeyboard([
          [{ text: "Cencel", callback_data: "cencel_adding" }],
        ]),
      });
      await context.setContext(chatId, "currentAction", () => "addSubtitle");
      break;

    case "addSubtitle":
      if (text !== ".") {
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, subtitle: formatText(text) };
        });
      }
      sendMessage("📜 Please enter the BODY :", chatId, {
        ...createInlineKeyboard([
          [{ text: "Cencel", callback_data: "cencel_adding" }],
        ]),
      });
      await context.setContext(chatId, "currentAction", () => "addBody");
      break;

    case "addBody":
      if (text.trim() === "") {
        return sendMessage("⚠️ Body cannot be empty", chatId);
      }
      await context.setContext(chatId, "newRepetition", (prevRepetition) => {
        return { ...prevRepetition, body: formatText(text) };
      });
      newRepData = await context.getContext(chatId, "newRepetition");
      await clearTrash(chatId);
      await context.setContext(chatId, "isFormated", () => true);
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
      await context.setContext(chatId, "currentAction", () => "checkNewRep");
      break;
  }

  await clearTrash(chatId);
}
