import { bot } from "../bot.js";

export default async function editMessageReplyMarkup(
  inlineKeyboards,
  chatId,
  messageId
) {
  await bot.editMessageReplyMarkup(inlineKeyboards, {
    chat_id: chatId,
    message_id: messageId,
  });
}
