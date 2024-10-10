import { context, repetitionsTimes } from "../states/state.js";
import {
  addTimeStringToDate,
  createInlineKeyboard,
  createPaginationBtns,
  splitArray,
} from "../utils/helpers.js";
import { bot } from "../bot.js";
import answerCallbackQuery from "../modules/answerCallbackQuery.js";
import sendMessage from "../modules/sendMessage.js";
import {
  findRepetitionById,
  getOldRepetitions,
  saveRepetition,
} from "../services/repetitionService.js";
import show_menu from "../modules/show_menu.js";
import t from "../langs/index.js";

export default async function onCallbackQuery(callbackQuery) {
  const data = callbackQuery.data;
  const queryId = callbackQuery.id;
  const chatId = callbackQuery.message.chat.id;
  let repetitionId,
    repetition,
    timesList,
    nextRepetitionDate,
    paginationData,
    oldRepetitions;

  switch (true) {
    case data === "add_new":
      await context.setContext(chatId, "currentAction", (user) => "addTitle");
      await context.setContext(chatId, "isRepetitioning", () => false);
      await sendMessage(
        `📌 ${await t("Please enter the TITLE", chatId)}`,
        chatId,
        {
          ...createInlineKeyboard([
            [
              {
                text: await t("Cancel", chatId),
                callback_data: "cencel_adding",
              },
            ],
          ]),
        }
      );
      await answerCallbackQuery(
        queryId,
        await t("Enter repetitions data", chatId)
      );
      break;

    case data === "cencel_adding":
      await context.setContext(chatId, "newRepetition", (user) => {
        return {};
      });
      await answerCallbackQuery(queryId, `${await t("Canceled", chatId)}!`);
      await show_menu(queryId, chatId);
      break;

    case data === "confirm_adding":
      try {
        const thisRepetition = await saveRepetition(chatId);
        await context.setContext(chatId, "isRepetitioning", () => false);
        await answerCallbackQuery(queryId, `💾 ${await t("Saved", chatId)}`);
        await context.setContext(chatId, "isFormated", () => true);
        await sendMessage(
          `
🧠 ${await t("Repeat this", chatId)}:
          
📌 ${await t("Title", chatId)}: *${thisRepetition.title}*
${
  thisRepetition.subtitle !== undefined
    ? `\n🖋️ ${await t("Subtitle", chatId)}: ${thisRepetition.subtitle}\n`
    : ""
}
📜 ${await t("Body", chatId)}:\n
||${thisRepetition.body}||
          `,
          chatId,
          {
            ...createInlineKeyboard([
              [
                {
                  text: `❌ ${await t("False", chatId)}`,
                  callback_data: `false_${thisRepetition._id}`,
                },
                {
                  text: `✅ ${await t("True", chatId)}`,
                  callback_data: `true_${thisRepetition._id}`,
                },
              ],
              [
                {
                  text: `🔄 ${await t("Again", chatId)}`,
                  callback_data: `again_${thisRepetition._id}`,
                },
                {
                  text: `😎 ${await t("Easy", chatId)}`,
                  callback_data: `easy_${thisRepetition._id}`,
                },
                {
                  text: `📋 ${await t("Others", chatId)}`,
                  callback_data: `get_list`,
                },
              ],
            ]),
          }
        );
      } catch (error) {
        console.log(
          ">> On saving new repetition: (callback.js) >> ",
          error.message
        );
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: `${await t("Something went wrong", chatId)}!`,
          show_alert: true,
        });
      }
      await context.setContext(chatId, "newRepetition", (user) => {
        return {};
      });
      break;

    case data.startsWith("false_"):
      repetitionId = data.split("_")[1];
      repetition = await findRepetitionById(repetitionId, chatId);
      if (!repetition)
        return answerCallbackQuery(queryId, "Repetition not found");
      repetition.step = 2;
      timesList = await repetitionsTimes.getState();
      nextRepetitionDate = addTimeStringToDate(
        new Date(),
        timesList[repetition.step]
      );
      repetition.nextRepetition = nextRepetitionDate;
      await repetition.save();
      await show_menu(queryId, chatId);
      await answerCallbackQuery(queryId, "Next repetition date updated");
      break;

    case data.startsWith("true_"):
      repetitionId = data.split("_")[1];
      repetition = await findRepetitionById(repetitionId, chatId);
      if (!repetition)
        return answerCallbackQuery(queryId, "Repetition not found");
      repetition.step = repetition.step + 1;
      timesList = await repetitionsTimes.getState();
      nextRepetitionDate = addTimeStringToDate(
        new Date(),
        timesList[repetition.step]
      );
      repetition.nextRepetition = nextRepetitionDate;
      await repetition.save();
      await show_menu(queryId, chatId);
      await answerCallbackQuery(queryId, "Next repetition date updated");
      break;

    case data.startsWith("again_"):
      repetitionId = data.split("_")[1];
      repetition = await findRepetitionById(repetitionId, chatId);
      if (!repetition)
        return answerCallbackQuery(
          queryId,
          await t("Repetition not found", chatId)
        );
      timesList = await repetitionsTimes.getState();
      nextRepetitionDate = addTimeStringToDate(new Date(), timesList[0]);
      repetition.nextRepetition = nextRepetitionDate;
      await repetition.save();
      await answerCallbackQuery(
        queryId,
        await t("You will receive a reminder in 10 minutes", chatId)
      );
      await show_menu(queryId, chatId);
      break;

    case data.startsWith("easy_"):
      repetitionId = data.split("_")[1];
      repetition = await findRepetitionById(repetitionId, chatId);
      if (!repetition)
        return answerCallbackQuery(queryId, "Repetition not found");
      repetition.step = repetition.step + 2;
      timesList = await repetitionsTimes.getState();
      nextRepetitionDate = addTimeStringToDate(
        new Date(),
        timesList[repetition.step]
      );
      repetition.nextRepetition = nextRepetitionDate;
      await repetition.save();
      await show_menu(queryId, chatId);
      await answerCallbackQuery(queryId, "Next repetition date updated");
      break;

    case data === "get_list":
      await context.setContext(chatId, "pagination", () => {
        return { currentPage: 1 };
      });
      await show_menu(queryId, chatId);
      break;

    case data === "show_list":
      paginationData = await context.getContext(chatId, "pagination");
      await context.setContext(chatId, "isRepetitioning", () => false);
      oldRepetitions = await getOldRepetitions(
        chatId,
        paginationData?.currentPage || 1
      );

      paginationData = await context.setContext(
        chatId,
        "pagination",
        async () => {
          return {
            currentPage: oldRepetitions.currentPage,
            totalPages: oldRepetitions.totalPages,
          };
        }
      );
      await context.setContext(chatId, "isFormated", () => true);
      sendMessage(
        `
      ${await t("Complate tasks on time", chatId)}❗️
      ${oldRepetitions.data.map(
        (rep, index) =>
          `\n${index + 1}\\. *${rep.title}*${
            rep?.subtitle ? `\n\\- ${rep.subtitle}` : ""
          }`
      )}
      `,
        chatId,
        {
          ...createInlineKeyboard([
            ...splitArray(
              oldRepetitions.data.map((rep, index) => {
                return {
                  text: `${index + 1}`,
                  callback_data: `repe_${rep._id}`,
                };
              })
            ),
            createPaginationBtns(
              paginationData?.currentPage || 1,
              paginationData?.totalPages || 1
            ),
            [{ text: "🔙", callback_data: "get_list" }],
          ]),
        }
      );
      answerCallbackQuery(queryId, "");
      break;

    case data.startsWith("page_"):
      let page = data.split("_")[1];

      paginationData = await context.getContext(chatId, "pagination");
      oldRepetitions = await getOldRepetitions(chatId, page);
      paginationData = await context.setContext(
        chatId,
        "pagination",
        async () => {
          return {
            currentPage: page * 1,
            totalPages: oldRepetitions.totalPages,
          };
        }
      );
      await context.setContext(chatId, "isFormated", () => true);
      sendMessage(
        `
      Complete tasks on time❗️
      ${oldRepetitions.data.map(
        (rep, index) =>
          `\n${index + 1}\\. *${rep.title}*${
            rep?.subtitle ? `\n\\- ${rep.subtitle}` : ""
          }`
      )}
      `,
        chatId,
        {
          ...createInlineKeyboard([
            ...splitArray(
              oldRepetitions.data.map((rep, index) => {
                return {
                  text: `${index + 1}`,
                  callback_data: `repe_${rep._id}`,
                };
              })
            ),
            createPaginationBtns(
              paginationData.currentPage,
              paginationData.totalPages
            ),
            [{ text: "🔙", callback_data: "get_list" }],
          ]),
        }
      );
      answerCallbackQuery(queryId, "");
      break;

    case data.startsWith("repe_"):
      await context.setContext(chatId, "isRepetitioning", () => true);
      repetitionId = data.split("_")[1];
      let thisRepetition = await findRepetitionById(repetitionId, chatId);
      if (!thisRepetition)
        return answerCallbackQuery(queryId, "Repetition not found!");
      answerCallbackQuery(queryId, "Loading ...");
      await context.setContext(chatId, "isFormated", () => true);
      await sendMessage(
        `
🧠 ${await t("Repeat this", chatId)}:
        
📌 ${await t("Title", chatId)}: *${thisRepetition.title}*
${
  thisRepetition.subtitle !== undefined
    ? `\n🖋️ ${await t("Subtitle", chatId)}: ${thisRepetition.subtitle}\n`
    : ""
}
📜 ${await t("Body", chatId)}:\n
||${thisRepetition.body}||
        `,
        chatId,
        {
          ...createInlineKeyboard([
            [
              {
                text: `❌ ${await t("False", chatId)}`,
                callback_data: `false_${thisRepetition._id}`,
              },
              {
                text: `✅ ${await t("True", chatId)}`,
                callback_data: `true_${thisRepetition._id}`,
              },
            ],
            [
              {
                text: `🔄 ${await t("Again", chatId)}`,
                callback_data: `again_${thisRepetition._id}`,
              },
              {
                text: `😎 ${await t("Easy", chatId)}`,
                callback_data: `easy_${thisRepetition._id}`,
              },
              {
                text: `📋 ${await t("Others", chatId)}`,
                callback_data: `get_list`,
              },
            ],
          ]),
        }
      );

      break;

    case data.startsWith("lang_"):
      let lang = data.split("_")[1];

      await context.setContext(chatId, "currentLang", () => lang);
      await answerCallbackQuery(
        queryId,
        await t("Successfully updated", chatId)
      );
      await show_menu(queryId, chatId);

      t("True", chatId);
      break;

    case data === "noop":
      console.log(queryId);

      await answerCallbackQuery(queryId, "");
      break;
  }
}
