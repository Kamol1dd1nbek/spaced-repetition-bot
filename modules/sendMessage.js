import { bot } from "../bot.js";
import { context } from "../states/state.js";

export default async function sendMessage(msg, chatId, options) {
  const mainMsg = await context.getContext(chatId, "mainMessage");
  const isFormatedtext = await context.getContext(chatId, "isFormated");

  if (Object.keys(mainMsg).length && !isFormatedtext) {
    try {
      const editedMsg = await bot.editMessageText(msg, {
        chat_id: mainMsg.chat.id,
        message_id: mainMsg.message_id,
        ...options,
      });
      await context.setContext(chatId, "mainMessage", () => editedMsg);
    } catch (error) {
      console.log(error.message);
    }
  } else if (Object.keys(mainMsg).length && isFormatedtext) {
    const sentMessage = await bot.sendMessage(chatId, msg, {
      parse_mode: "MarkdownV2",
      ...options,
    });
    await bot.deleteMessage(chatId, mainMsg.message_id);
    await context.setContext(chatId, "mainMessage", () => sentMessage);
    await context.setContext(chatId, "isFormated", () => false);
  } else {
    try {
      const sentMsg = await bot.sendMessage(chatId, msg, {
        parse_mode: "MarkdownV2",
        ...options,
      });
      await context.setContext(chatId, "mainMessage", () => sentMsg);
    } catch (error) {
      console.log(error.message);
    }
  }
}
