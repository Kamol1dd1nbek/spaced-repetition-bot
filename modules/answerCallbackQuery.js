import { bot } from "../bot.js";

export default async function answerCallbackQuery(
  queryId,
  text,
  showAlert = false
) {
  await bot.answerCallbackQuery(queryId, {
    text,
    showAlert,
  });
}
