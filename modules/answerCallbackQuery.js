import { bot } from "../bot.js";

export default async function answerCallbackQuery(
  queryId,
  text,
  showAlert = false,
) {
  try {
    await bot.answerCallbackQuery(queryId, {
      text,
      showAlert,
    });
  } catch (error) {
    console.log(error.message);
  }
}
