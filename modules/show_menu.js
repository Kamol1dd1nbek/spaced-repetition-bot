import t from "../langs/index.js";
import { getOldRepetitions } from "../services/repetitionService.js";
import { context } from "../states/state.js";
import { createInlineKeyboard } from "../utils/helpers.js";
import answerCallbackQuery from "./answerCallbackQuery.js";
import sendMessage from "./sendMessage.js";

async function show_menu(queryId, chatId) {
  await context.setContext(chatId, "isRepetitioning", () => false);
  const oldRepetitions = await getOldRepetitions(chatId);
  await context.setContext(chatId, "isFormated", () => true);

  let msg_text = "";
  if (oldRepetitions?.totalCount > 0)
    msg_text = `${await t("Number of details you need to repeat", chatId)}: ${
      oldRepetitions.totalCount
    }`;
  else msg_text = await t("You have no rehearsals to repeat", chatId);

  await sendMessage(msg_text, chatId, {
    ...createInlineKeyboard([
      [
        ...(oldRepetitions.totalCount > 0
          ? [
              {
                text: `📜 ${await t("Show list", chatId)}`,
                callback_data: "show_list",
              },
            ]
          : []),
      ],
      [
        {
          text: `➕ ${await t("Add new", chatId)}`,
          callback_data: "add_new",
        },
      ],
      [
        {
          text: `🔄 ${await t("Reload", chatId)}`,
          callback_data: "get_list",
        },
      ],
    ]),
  });
  await answerCallbackQuery(queryId, "");
}

export default show_menu;
