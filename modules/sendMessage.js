import { bot } from "../bot.js";
import { isFormated, mainMessage } from "../states/state.js";

export default async function sendMessage(msg, chatId, options) {
  const mainMsg = await mainMessage.getState();
  const isFormatedtext = await isFormated.getState();

  if (Object.keys(mainMsg).length && !isFormatedtext) {
    try {
      const editedMsg = await bot.editMessageText(msg, {
        chat_id: mainMsg.chat.id,
        message_id: mainMsg.message_id,
        ...options,
      });
      await mainMessage.setState(() => editedMsg);
    } catch (error) {
      console.log(error.message);
    }
  } else if (Object.keys(mainMsg).length && isFormatedtext) {
    const sentMessage = await bot.sendMessage(chatId, msg, {
      parse_mode: "MarkdownV2",
      ...options,
    });
    await bot.deleteMessage(chatId, mainMsg.message_id);
    await mainMessage.setState(() => sentMessage);
    await isFormated.setState(() => false);
  } else {
    try {
      const sentMsg = await bot.sendMessage(chatId, msg, {
        parse_mode: "MarkdownV2",
        ...options,
      });
      await mainMessage.setState(() => sentMsg);
    } catch (error) {
      console.log(error.message);
    }
  }
}
