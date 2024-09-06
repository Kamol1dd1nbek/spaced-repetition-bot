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
      // await currentAction.setState(() => "addTitle");
      await sendMessage("📌 Please enter the TITLE :", chatId, {
        ...createInlineKeyboard([
          [{ text: "Cencel", callback_data: "cencel_adding" }],
        ]),
      });
      await answerCallbackQuery(queryId, "Enter repetitions data");
      break;

    case data === "cencel_adding":
      await context.setContext(chatId, "newRepetition", (user) => {
        return {};
      });
      // await newRepetition.setState(() => {});
      await show_menu(queryId, chatId);
      await answerCallbackQuery(queryId, "Cencelled!");
      break;

    case data === "confirm_adding":
      try {
        const thisRepetition = await saveRepetition(chatId);
        await answerCallbackQuery(queryId, "💾 Saved!");
        await context.setContext(chatId, "isFormated", () => true);
        // await isFormated.setState(() => true);
        await sendMessage(
          `
🧠 Repeat this:
          
📌 Title: *${thisRepetition.title}*
${
  thisRepetition.subtitle !== undefined
    ? `\n🖋️ Subtitle: ${thisRepetition.subtitle}\n`
    : ""
}
📜 Body:\n
||${thisRepetition.body}||
          `,
          chatId,
          {
            ...createInlineKeyboard([
              [
                {
                  text: "❌ False",
                  callback_data: `false_${thisRepetition._id}`,
                },
                {
                  text: "✅ True",
                  callback_data: `true_${thisRepetition._id}`,
                },
              ],
              [
                {
                  text: "🔄 Again",
                  callback_data: `again_${thisRepetition._id}`,
                },
                {
                  text: "😎 Easy",
                  callback_data: `easy_${thisRepetition._id}`,
                },
                {
                  text: "📋 Others",
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
          text: "Something went wrong!",
          show_alert: true,
        });
      }
      await context.setContext(chatId, "newRepetition", (user) => {
        return {};
      });
      // newRepetition.setState(() => {});
      break;

    case data.startsWith("false_"):
      repetitionId = data.split("_")[1];
      repetition = await findRepetitionById(repetitionId, chatId);
      if (!repetition)
        return answerCallbackQuery(queryId, "Repetition not found");
      repetition.step = 1;
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
        return answerCallbackQuery(queryId, "Repetition not found");
      timesList = await repetitionsTimes.getState();
      nextRepetitionDate = addTimeStringToDate(new Date(), timesList[0]);
      repetition.nextRepetition = nextRepetitionDate;
      await repetition.save();
      await show_menu(queryId, chatId);
      await answerCallbackQuery(queryId, "Reminder after 10 minutes");
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
      await show_menu(queryId, chatId);
      break;

    case data === "show_list":
      paginationData = await context.getContext(chatId, "pagination");
      // return 1

      // paginationData = await pagination.getState();
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

      // paginationData = await pagination.setState(() => {
      //   return {
      //     currentPage: oldRepetitions.currentPage,
      //     totalPages: oldRepetitions.totalPages,
      //   };
      // });
      await context.setContext(chatId, "isFormated", (user) => true);
      // isFormated.setState(() => true);

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
      // paginationData = await pagination.getState();
      oldRepetitions = await getOldRepetitions(chatId, page);
      paginationData = await context.setContext(
        chatId,
        "pagination",
        async () => {
          return {
            currentPage: page,
            totalPages: oldRepetitions.totalPages,
          };
        }
      );
      // paginationData = await pagination.setState(() => {
      //   return { currentPage: page, totalPages: oldRepetitions.totalPages };
      // });
      await context.setContext(chatId, "isFormated", (user) => true);
      // isFormated.setState(() => true);
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
      repetitionId = data.split("_")[1];
      let thisRepetition = await findRepetitionById(repetitionId, chatId);
      if (!thisRepetition)
        return answerCallbackQuery(queryId, "Repetition not found!");
      answerCallbackQuery(queryId, "Loading ...");
      await context.setContext(chatId, "isFormated", () => true);
      // await isFormated.setState(() => true);
      await sendMessage(
        `
🧠 Repeat this:
        
📌 Title: *${thisRepetition.title}*
${
  thisRepetition.subtitle !== undefined
    ? `\n🖋️ Subtitle: ${thisRepetition.subtitle}\n`
    : ""
}
📜 Body:\n
||${thisRepetition.body}||
        `,
        chatId,
        {
          ...createInlineKeyboard([
            [
              {
                text: "❌ False",
                callback_data: `false_${thisRepetition._id}`,
              },
              {
                text: "✅ True",
                callback_data: `true_${thisRepetition._id}`,
              },
            ],
            [
              {
                text: "🔄 Again",
                callback_data: `again_${thisRepetition._id}`,
              },
              {
                text: "😎 Easy",
                callback_data: `easy_${thisRepetition._id}`,
              },
              {
                text: "📋 Others",
                callback_data: `get_list`,
              },
            ],
          ]),
        }
      );

      break;

    case data === "noop":
      await answerCallbackQuery(queryId, "");
      break;
  }
}
