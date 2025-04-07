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
  updateCard,
} from "../services/repetitionService.js";
import show_menu from "../modules/show_menu.js";
import t from "../langs/index.js";
import sendMediaMessage from "../modules/sendMediaMessage.js";
import Repetition from "../models/Repetition.js";

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
      await context.setContext(chatId, "isRepetitioning", () => true);
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
        },
      );
      await answerCallbackQuery(
        queryId,
        await t("Enter repetitions data", chatId),
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
        await context.setContext(chatId, "isRepetitioning", () => true);
        await answerCallbackQuery(queryId, `💾 ${await t("Saved", chatId)}`);
        await context.setContext(chatId, "isFormated", () => true);

        if (thisRepetition.type !== "text") {
          return await sendMediaMessage(
            chatId,
            thisRepetition,
            {
              ...createInlineKeyboard([
                [
                  {
                    text: "0",
                    callback_data: `response_${thisRepetition._id}_0`,
                  },
                  {
                    text: "1",
                    callback_data: `response_${thisRepetition._id}_1`,
                  },
                  {
                    text: "2",
                    callback_data: `response_${thisRepetition._id}_2`,
                  }
                ],
                [
                  {
                    text: "3",
                    callback_data: `response_${thisRepetition._id}_3`,
                  },
                  {
                    text: "4",
                    callback_data: `response_${thisRepetition._id}_4`,
                  },
                  {
                    text: "5",
                    callback_data: `response_${thisRepetition._id}_5`,
                  }
                ],
                [
                  {
                    text: `🗑 ${await t("Delete", chatId)}`,
                    callback_data: `delete_${thisRepetition._id}`,
                  },
                  {
                    text: `📋 ${await t("Others", chatId)}`,
                    callback_data: `get_list_${thisRepetition._id}`,
                  },
                ]
              ]),
            },
            `     
        📜 ${await t("Body", chatId)}: 👆
        ${
          thisRepetition.bodyText !== undefined
            ? `\n💬 ${await t("Body text", chatId)}: ${thisRepetition.bodyText}`
            : ""
        }
        \n📌 ${await t("Title", chatId)}: *${thisRepetition.title}*
        ${
          thisRepetition.subtitle !== undefined
            ? `\n🖋️ ${await t("Subtitle", chatId)}: ${thisRepetition.subtitle}\n`
            : ""
        }
        `,
          );
        }
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
                  text: "0",
                  callback_data: `response_${thisRepetition._id}_0`,
                },
                {
                  text: "1",
                  callback_data: `response_${thisRepetition._id}_1`,
                },
                {
                  text: "2",
                  callback_data: `response_${thisRepetition._id}_2`,
                }
              ],
              [
                {
                  text: "3",
                  callback_data: `response_${thisRepetition._id}_3`,
                },
                {
                  text: "4",
                  callback_data: `response_${thisRepetition._id}_4`,
                },
                {
                  text: "5",
                  callback_data: `response_${thisRepetition._id}_5`,
                }
              ],
              [
                {
                  text: `🗑 ${await t("Delete", chatId)}`,
                  callback_data: `delete_${thisRepetition._id}`,
                },
                {
                  text: `📋 ${await t("Others", chatId)}`,
                  callback_data: `get_list_${thisRepetition._id}`,
                },
              ]
            ]),
          },
        );
      } catch (error) {
        console.log(
          ">> On saving new repetition: (callback.js) >> ",
          error.message,
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

    case data.startsWith("delete_"):
      try {
        repetitionId = data.split("_")[1];
        repetition = await findRepetitionById(repetitionId, chatId);
        if (!repetition)
          return answerCallbackQuery(queryId, "Repetition not found");
        await context.setContext(chatId, "isRepetitioning", () => true);
        await context.setContext(
          chatId,
          "currentAction",
          (user) => "checkDeleting",
        );
        await answerCallbackQuery(
          queryId,
          `💾 ${await t("Confirm deletion", chatId)}`,
        );
        await sendMessage(
          `${await t("Are you sure you want to delete this repetition?")}`,
          chatId,
          {
            ...createInlineKeyboard([
              [
                {
                  text: `🗑 ${await t("Delete", chatId)}`,
                  callback_data: `confirm_delete_${repetitionId}`,
                },
                {
                  text: `🔙 ${await t("Cancel", chatId)}`,
                  callback_data: `get_list_null`,
                },
              ],
            ]),
          },
        );
      } catch (error) {
        console.log(
          ">> On check confirm deletion repetition: (callbacks.js) >> ",
          error.message,
        );
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: `${await t("Something went wrong", chatId)}!`,
          show_alert: true,
        });
      }
      break;

    case data.startsWith("confirm_delete_"):
      try {
        repetitionId = data.split("_")[2];
        await Repetition.findByIdAndDelete(repetitionId).then(
          async (result) => {
            if (result) {
              await bot.answerCallbackQuery(callbackQuery.id, {
                text: `${await t("Deleted", chatId)}!`,
              });
            } else {
              awaitbot.answerCallbackQuery(callbackQuery.id, {
                text: `${await t("Repetition not found", chatId)}!`,
                show_alert: true,
              });
            }
          },
        );
        await context.setContext(chatId, "currentAction", (user) => "");
        await context.setContext(chatId, "isRepetitioning", () => false);
        await show_menu(queryId, chatId);
      } catch (error) {
        console.log(
          ">> On deleting repetition: (callbacks.js) >> ",
          error.message,
        );
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: `${await t("Something went wrong", chatId)}!`,
          show_alert: true,
        });
      }
      break;

    case data.startsWith("get_list_"):
      repetitionId = data.split("_")[2];
      if (repetitionId !== "null") {
        repetition = await findRepetitionById(repetitionId, chatId);
        if (repetition) {
          timesList = await repetitionsTimes.getState();
          repetition.nextRepetition = addTimeStringToDate(
            new Date(),
            timesList[0],
          );
          await repetition.save();
        }
      }

      await context.setContext(chatId, "pagination", () => {
        return { currentPage: 1 };
      });
      await show_menu(queryId, chatId);
      break;

    case data.startsWith("response_"):
      repetitionId = data.split("_")[1];
      // there is hard code: userId
      if(await updateCard(1, repetitionId, data.split("_")[2] * 1) === false) {
        return answerCallbackQuery(queryId, "Repetition not found");
      }
      
      await answerCallbackQuery(queryId, "Next repetition date updated");

    case data === "show_list":
      paginationData = await context.getContext(chatId, "pagination");
      await context.setContext(chatId, "isRepetitioning", () => true);
      oldRepetitions = await getOldRepetitions(
        chatId,
        paginationData?.currentPage || 1,
      );
      
      paginationData = await context.setContext(
        chatId,
        "pagination",
        async () => {
          return {
            currentPage: oldRepetitions.currentPage,
            totalPages: oldRepetitions.totalPages,
          };
        },
      );
      await context.setContext(chatId, "isFormated", () => true);
      sendMessage(
        `
      ${await t("Complate tasks on time", chatId)}❗️
      ${oldRepetitions.data.map(
        (rep, index) =>
          `\n${index + 1}\\. *${rep.title}*${
            rep?.subtitle ? `\n\\- ${rep.subtitle}` : ""
          }`,
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
              }),
            ),
            createPaginationBtns(
              paginationData?.currentPage || 1,
              paginationData?.totalPages || 1,
            ),
            [{ text: "🔙", callback_data: `get_list_null` }],
          ]),
        },
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
        },
      );
      await context.setContext(chatId, "isFormated", () => true);
      sendMessage(
        `
      Complete tasks on time❗️
      ${oldRepetitions.data.map(
        (rep, index) =>
          `\n${index + 1}\\. *${rep.title}*${
            rep?.subtitle ? `\n\\- ${rep.subtitle}` : ""
          }`,
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
              }),
            ),
            createPaginationBtns(
              paginationData.currentPage,
              paginationData.totalPages,
            ),
            [{ text: "🔙", callback_data: `get_list_null` }],
          ]),
        },
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
      if (thisRepetition.type !== "text" && thisRepetition?.type) {
        return await sendMediaMessage(
          chatId,
          thisRepetition,
          {
            ...createInlineKeyboard([
              [
                {
                  text: "0",
                  callback_data: `response_${thisRepetition._id}_0`,
                },
                {
                  text: "1",
                  callback_data: `response_${thisRepetition._id}_1`,
                },
                {
                  text: "2",
                  callback_data: `response_${thisRepetition._id}_2`,
                }
              ],
              [
                {
                  text: "3",
                  callback_data: `response_${thisRepetition._id}_3`,
                },
                {
                  text: "4",
                  callback_data: `response_${thisRepetition._id}_4`,
                },
                {
                  text: "5",
                  callback_data: `response_${thisRepetition._id}_5`,
                }
              ],
              [
                {
                  text: `🗑 ${await t("Delete", chatId)}`,
                  callback_data: `delete_${thisRepetition._id}`,
                },
                {
                  text: `📋 ${await t("Others", chatId)}`,
                  callback_data: `show_list`,
                },
              ]
            ]),
          },
          `     
      📜 ${await t("Body", chatId)}: 👆
      ${
        thisRepetition.bodyText !== undefined
          ? `\n💬 ${await t("Body text", chatId)}: ${thisRepetition.bodyText}\n`
          : ""
      }
📌 ${await t("Title", chatId)}: *${thisRepetition.title}*
      ${
        thisRepetition.subtitle !== undefined
          ? `\n🖋️ ${await t("Subtitle", chatId)}: ${thisRepetition.subtitle}\n`
          : ""
      }
      `,
        );
      } else {
        if (!thisRepetition?.type) {
          thisRepetition.type = "text";
          await thisRepetition.save();
        }
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
                  text: "0",
                  callback_data: `response_${thisRepetition._id}_0`,
                },
                {
                  text: "1",
                  callback_data: `response_${thisRepetition._id}_1`,
                },
                {
                  text: "2",
                  callback_data: `response_${thisRepetition._id}_2`,
                }
              ],
              [
                {
                  text: "3",
                  callback_data: `response_${thisRepetition._id}_3`,
                },
                {
                  text: "4",
                  callback_data: `response_${thisRepetition._id}_4`,
                },
                {
                  text: "5",
                  callback_data: `response_${thisRepetition._id}_5`,
                }
              ],
              [
                {
                  text: `🗑 ${await t("Delete", chatId)}`,
                  callback_data: `delete_${thisRepetition._id}`,
                },
                {
                  text: `📋 ${await t("Others", chatId)}`,
                  callback_data: `show_list`,
                },
              ]
            ]),
          },
        );
      }
      break;

    case data.startsWith("lang_"):
      let lang = data.split("_")[1];

      await context.setContext(chatId, "currentLang", () => lang);
      await answerCallbackQuery(
        queryId,
        await t("Successfully updated", chatId),
      );
      await show_menu(queryId, chatId);

      t("True", chatId);
      break;

    case data === "reject_add_body_text":
      const newRepe = await context.getContext(chatId, "newRepetition");

      await sendMediaMessage(
        chatId,
        newRepe,
        {
          ...createInlineKeyboard([
            [
              {
                text: `❌ ${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
              {
                text: `✏️ ${await t("Edit", chatId)}`,
                web_app: { url: "https://github.com/Kamol1dd1nbek" },
              },
              {
                text: `✅ ${await t("Confirm", chatId)}`,
                callback_data: "confirm_adding",
              },
            ],
          ]),
        },
        `     
    📜 ${await t("Body", chatId)}: 👆
    \n📌 ${await t("Title", chatId)}: *${newRepe.title}*
    ${
      newRepe.subtitle !== undefined
        ? `\n🖋️ ${await t("Subtitle", chatId)}: ${newRepe.subtitle}\n`
        : ""
    }
    \n📋 ${await t("Please confirm the details you have provided", chatId)}
    `,
      );
      break;

    case data === "confirm_add_body_text":
      await context.setContext(
        chatId,
        "currentAction",
        (user) => "addBodyText",
      );
      await sendMessage(
        `${await t("Enter additional text for BODY ⌨️")}`,
        chatId,
        {
          ...createInlineKeyboard([
            [
              {
                text: `${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
            ],
          ]),
        },
      );
      break;

    case data === "noop":
      await answerCallbackQuery(queryId, "");
      break;
  }
}
