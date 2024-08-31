import Repetition from "../models/Repetition.js";
import { currentEditingPart, newRepetition } from "../states/state.js";
import { createInlineKeyboard } from "../utils/helpers.js";
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
      newRepetition.setState(() => {});
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
        // await new Repetition(await newRepetition.getState()).save();
        editMessageReplyMarkup(createInlineKeyboard([]), chatId, messageId);
        answerCallbackQuery(callbackQuery.id, "💾 Saved!");
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

    case "back_adding":
      await editMessageReplyMarkup(
        createInlineKeyboard([
          [
            { text: "❌ Cencel", callback_data: "cencel_adding" },
            {
              text: "✏️ Edit", // Tugmada ko'rinadigan matn
              web_app: { url: "https://www.example.com" } // Ochiladigan veb-sahifaning URL manzili
            },
            { text: "✅ Confirm", callback_data: "confirm_adding" },
          ],
        ]).reply_markup,
        chatId,
        messageId
      );
      break;

    case "edit_title_adding":
      currentEditingPart.setState(() => {
        return { name: "title", messageId };
      });
      sendMessage(
        chatId,
        `Current title\\: ${newRepData.title}\nPlease enter a new title\\:`
      );
      break;
  }
}
