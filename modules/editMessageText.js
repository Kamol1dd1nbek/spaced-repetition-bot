import { bot } from "../bot.js";

export default async function editMessageText(
  chatId,
  messageId,
  text,
  replyMarkup,
) {
  bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    ...(replyMarkup && { reply_markup: replyMarkup }),
  });
}
