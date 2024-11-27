import t from "../langs/index.js";
import {
  getFarthestOverdueRepetition,
  getNextRepetition,
} from "../services/repetitionService.js";
import { context, repetitionsTimes } from "../states/state.js";
import {
  addTimeStringToDate,
  createInlineKeyboard,
  getTimeDifferenceInMilliseconds,
} from "../utils/helpers.js";
import sendMediaMessage from "./sendMediaMessage.js";
import sendMessage from "./sendMessage.js";

async function setReminder(chatId) {
  let tId = await context.getContext(chatId, "timeoutId");

  if (tId) clearInterval(tId);
  const nextRepetition = await getNextRepetition(chatId);
  const earliestOverdueRepetition = await getFarthestOverdueRepetition(chatId);

  if (earliestOverdueRepetition) {
    earliestOverdueRepetition.nextRepetition = addTimeStringToDate(
      new Date(),
      "25 minutes",
    );
    earliestOverdueRepetition.save();
  }

  if (nextRepetition) {
    tId = setTimeout(
      async () => {
        if (!(await context.getContext(chatId, "isRepetitioning"))) {
          await context.setContext(chatId, "isFormated", () => true);
          await context.setContext(chatId, "isRepetitioning", () => true);

          if (nextRepetition.type !== "text" && nextRepetition?.type !== undefined) {
            return await sendMediaMessage(
              chatId,
              nextRepetition,
              {
                ...createInlineKeyboard([
                  [
                    {
                      text: `❌ ${await t("False", chatId)}`,
                      callback_data: `false_${nextRepetition._id}`,
                    },
                    {
                      text: `✅ ${await t("True", chatId)}`,
                      callback_data: `true_${nextRepetition._id}`,
                    },
                  ],
                  [
                    {
                      text: `🔄 ${await t("Again", chatId)}`,
                      callback_data: `again_${nextRepetition._id}`,
                    },
                    {
                      text: `😎 ${await t("Easy", chatId)}`,
                      callback_data: `easy_${nextRepetition._id}`,
                    },
                    {
                      text: `📋 ${await t("Others", chatId)}`,
                      callback_data: `get_list_${nextRepetition._id}`,
                    },
                  ],
                ]),
              },
              `     
          📜 ${await t("Body", chatId)}: 👆
          ${
            nextRepetition.bodyText !== undefined
              ? `\n💬 ${await t("Body text", chatId)}: ${nextRepetition.bodyText}\n`
              : ""
          }
📌 ${await t("Title", chatId)}: *${nextRepetition.title}*
          ${
            nextRepetition.subtitle !== undefined
              ? `\n🖋️ ${await t("Subtitle", chatId)}: ${nextRepetition.subtitle}\n`
              : ""
          }
          `,
            );
          } else {
            await sendMessage(
              `
  🧠 ${await t("Repeat this", chatId)}:
            
  📌 ${await t("Title", chatId)}: *${nextRepetition.title}*
  ${
    nextRepetition.subtitle !== undefined
      ? `\n🖋️ ${await t("Subtitle", chatId)}: ${nextRepetition.subtitle}\n`
      : ""
  }
  📜 ${await t("Body", chatId)}:\n
  ||${nextRepetition.body}||
  `,
              chatId,
              {
                ...createInlineKeyboard([
                  [
                    {
                      text: `❌ ${await t("False", chatId)}`,
                      callback_data: `false_${nextRepetition._id}`,
                    },
                    {
                      text: `✅ ${await t("True", chatId)}`,
                      callback_data: `true_${nextRepetition._id}`,
                    },
                  ],
                  [
                    {
                      text: `🔄 ${await t("Again", chatId)}`,
                      callback_data: `again_${nextRepetition._id}`,
                    },
                    {
                      text: `😎 ${await t("Easy", chatId)}`,
                      callback_data: `easy_${nextRepetition._id}`,
                    },
                    {
                      text: `📋 ${await t("Others", chatId)}`,
                      callback_data: `get_list_${nextRepetition._id}`,
                    },
                  ],
                ]),
              },
            );
          }
          setReminder(chatId);
        } else {
          const timesList = await repetitionsTimes.getState();
          nextRepetition.nextRepetition = addTimeStringToDate(
            new Date(),
            timesList[0],
          );
        }
      },
      getTimeDifferenceInMilliseconds(
        new Date(),
        nextRepetition.nextRepetition,
      ),
    );

    await context.setContext(chatId, "timeoutId", () => tId);
  }
}

export default setReminder;
