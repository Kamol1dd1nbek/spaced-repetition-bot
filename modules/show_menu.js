import { getOldRepetitions } from "../services/repetitionService.js";
import { context, isFormated, isRepetitioning } from "../states/state.js";
import { createInlineKeyboard } from "../utils/helpers.js";
import answerCallbackQuery from "./answerCallbackQuery.js";
import sendMessage from "./sendMessage.js";

async function show_menu(queryId, chatId) {
  await context.setContext(chatId, "isRepetitioning", () => false);
  // isRepetitioning.setState(() => false);
  const oldRepetitions = await getOldRepetitions(chatId);

  await context.setContext(chatId, "isFormated", () => true);
  // isFormated.setState(() => true);

  let msg_text = "";
  if (oldRepetitions?.totalCount > 0)
    msg_text = `You have ${oldRepetitions.totalCount} repetitions to complete`;
  else msg_text = `You have no rehearsals to repeat`;
  await sendMessage(msg_text, chatId, {
    ...createInlineKeyboard([
      [
        ...(oldRepetitions.totalCount > 0
          ? [{ text: "📜 Show list", callback_data: "show_list" }]
          : []),
      ],
      [
        {
          text: "➕ Add new",
          callback_data: "add_new",
        },
      ],
      [
        {
          text: "🔄 Reload",
          callback_data: "get_list",
        },
      ],
    ]),
  });
  await answerCallbackQuery(queryId, "");
}

export default show_menu;
