import { bot } from "../bot.js";
import { trash } from "../states/state.js";

export default async function sendMessage(chatId, msg, options) {
  const sentMessage = await bot.sendMessage(chatId, msg, {
    parse_mode: "MarkdownV2",
    ...options,
  });
  await trash.setState((prev) => [
    ...prev,
    { chat_id: sentMessage.chat.id, message_id: sentMessage.message_id },
  ]);
}
