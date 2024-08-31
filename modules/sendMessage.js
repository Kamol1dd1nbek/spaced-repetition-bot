import { bot } from "../bot.js";
import { trash } from "../states/state.js";

export default async function sendMessage(chatId, msg, options) {
  const sentMessage = await bot.sendMessage(chatId, msg, {
    parse_mode: "MarkdownV2",
    ...options,
  });
  trash.setState((prev) => [...prev, sentMessage.message_id]);
}
