import Repetition from "../models/Repetition.js";
import { currentEditingPart, newRepetition } from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
} from "../utils/helpers.js";
import { bot } from "../bot.js";
import answerCallbackQuery from "../modules/answerCallbackQuery.js";
import editMessageReplyMarkup from "../modules/editMessageReplyMarkup.js";
import sendMessage from "../modules/sendMessage.js";
// TODO: clean here
export default async function onCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const newRepData = await newRepetition.getState();

  switch (data) {
    case "cencel_adding":
      await newRepetition.setState(() => {});
      await clearTrash();
      await sendMessage(chatId, "Adding information has been cancelled", {
        ...createKeyboard([["➕ Add new"]]),
      });
      break;
    // TODO: write responsible query data format as `again_${repetition.id}`
    case "edit_adding":
      await editMessageReplyMarkup(
        createInlineKeyboard([
          [
            { text: "📌 Title", callback_data: "edit_title_adding" },
            ...(newRepData.subtitle
              ? [
                  {
                    text: "🖋️ Subtitle",
                    callback_data: "edit_subtitle_adding",
                  },
                ]
              : []),
            { text: "📜 Body", callback_data: "edit_body_adding" },
          ],
          [{ text: "🔙", callback_data: "back_adding" }],
        ]).reply_markup,
        chatId,
        messageId
      );
      break;

    case "confirm_adding":
      try {
        answerCallbackQuery(callbackQuery.id, "💾 Saved!");
        await clearTrash();
      } catch (error) {
        console.log(
          ">> On saving new repetition: (callback.js) >> ",
          error.message
        );
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: "Something went wrong!",
          show_alert: true,
        });
      }
      newRepetition.setState(() => {});
      break;
  }
}

// ❌ false
// ✅ true
// Row 2:
// 🔄 again
// 😎 easy
// ➡️ next
