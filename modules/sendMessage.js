import { bot } from "../bot.js";
import { mainMessage, trash } from "../states/state.js";

export default async function sendMessage(msg, chatId, options) {
  const mainMsg = await mainMessage.getState();

  if (Object.keys(mainMsg).length) {
    try {
      const editedMsg = await bot.editMessageText(msg, {
        chat_id: mainMsg.chat.id,
        message_id: mainMsg.message_id,
        ...options,
      });
      console.log(editedMsg);
      
      await mainMessage.setState(() => editedMsg)
    } catch (error) {
      console.log(error.message);
    }
  } else {
    console.log(2);
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
