import { bot } from "../bot.js";
import config from "../environment/config.js";
import t from "../langs/index.js";
import archiveMedia from "../modules/archiveMedia.js";
import sendMediaMessage from "../modules/sendMediaMessage.js";
import sendMessage from "../modules/sendMessage.js";
import { context, repetitionsTimes } from "../states/state.js";
import {
  addTimeStringToDate,
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
  formatText,
} from "../utils/helpers.js";

export default async function onMessage(msg) {
  const chatId = msg.chat.id;
  let text = msg?.text;
  let msgType;

  switch (true) {
    case msg?.photo !== undefined:
      msgType = "photo";
      break;
    case msg?.video !== undefined:
      msgType = "video";
      break;
    case msg?.voice !== undefined:
      msgType = "voice";
      break;
    case msg?.text !== undefined:
      msgType = "text";
      break;
    case msg?.document !== undefined:
      msgType = "document";
      break;
  }

  if (!["photo", "video", "voice", "text", "document"].includes(msgType)) {
    sendMessage(
      (await t(
        "Sorry, the data type you submitted is not currently supported",
        chatId,
      )) + " 😕❗",
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
    return await clearTrash(chatId, msg.message_id);
  }

  await context.setContext(chatId, "trash", (trash) => [
    ...trash,
    { chat_id: chatId, message_id: msg.message_id },
  ]);
  let newRepData = await context.getContext(chatId, "newRepetition");

  switch (await context.getContext(chatId, "currentAction")) {
    case "addTitle":
      if (msgType !== "text") {
        msgType = undefined;
        sendMessage(`${await t("Please enter text")}`, chatId, {
          ...createInlineKeyboard([
            [
              {
                text: `${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
            ],
          ]),
        });
      } else if (text.trim() === "") {
        sendMessage("⚠️ Title cannot be empty", chatId);
      } else {
        await context.setContext(chatId, "isRepetitioning", () => true);
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, title: formatText(text), chatId };
        });
        sendMessage(
          `🖋️ ${await t("Please enter the SUBTITLE", chatId)}`,
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
        await context.setContext(chatId, "currentAction", () => "addSubtitle");
      }
      break;

    case "addSubtitle":
      if (msgType !== "text") {
        msgType = undefined;
        sendMessage(`${await t("Please enter text")}`, chatId, {
          ...createInlineKeyboard([
            [
              {
                text: `${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
            ],
          ]),
        });
      } else {
        if (text !== ".") {
          await context.setContext(
            chatId,
            "newRepetition",
            (prevRepetition) => {
              return { ...prevRepetition, subtitle: formatText(text) };
            },
          );
        }
        sendMessage(`📜 ${await t("Please enter the BODY", chatId)}:`, chatId, {
          ...createInlineKeyboard([
            [
              {
                text: `${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
            ],
          ]),
        });
        await context.setContext(chatId, "currentAction", () => "addBody");
      }
      break;

    case "addBody":
      if (msgType !== "text") {
        let archId = await archiveMedia(
          msg[msgType].file_id || msg[msgType][1].file_id,
          msgType,
        );
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, fileId: archId };
        });
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, type: msgType };
        });

        await context.setContext(
          chatId,
          "currentAction",
          () => "checkAddBodyText",
        );

        await sendMessage(
          "Do you want to add ✍️ additional text ? 😊",
          chatId,
          {
            ...createInlineKeyboard([
              [
                {
                  text: `${await t("No", chatId)}`,
                  callback_data: "reject_add_body_text",
                },
                {
                  text: `${await t("Yes", chatId)}`,
                  callback_data: "confirm_add_body_text",
                },
              ],
            ]),
          },
        );
      } else {
        if (text.trim() === "") {
          return sendMessage("⚠️ Body cannot be empty", chatId);
        }
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, body: formatText(text) };
        });
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, type: msgType };
        });

        newRepData = await context.getContext(chatId, "newRepetition");
        await clearTrash(chatId);
        await context.setContext(chatId, "isFormated", () => true);
        sendMessage(
          `
          📋 ${await t("Please confirm the details you have provided", chatId)}:
    
📌 ${await t("Title", chatId)}: *${newRepData.title}*
          ${
            newRepData.subtitle !== undefined
              ? `\n🖋️ ${await t("Subtitle", chatId)}: ${newRepData.subtitle}\n`
              : ""
          }
📜 ${await t("Body", chatId)}:\n
${newRepData.body}
          `,
          chatId,
          {
            ...createKeyboard([["Add"]]),
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
        );
        await context.setContext(chatId, "currentAction", () => "checkNewRep");
      }
      break;

    case "addBodyText":
      if (msgType !== "text") {
        msgType = undefined;
        sendMessage(`${await t("Please enter text")}`, chatId, {
          ...createInlineKeyboard([
            [
              {
                text: `${await t("Cancel", chatId)}`,
                callback_data: "cencel_adding",
              },
            ],
          ]),
        });
      } else {
        const newRepData = await context.setContext(
          chatId,
          "newRepetition",
          (prevRepetition) => {
            return { ...prevRepetition, bodyText: text };
          },
        );

        await sendMediaMessage(
          chatId,
          newRepData,
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
      ${
        newRepData.bodyText !== undefined
          ? `\n💬 ${await t("Body text", chatId)}: ${newRepData.bodyText}`
          : ""
      }
      \n📌 ${await t("Title", chatId)}: *${newRepData.title}*
      ${
        newRepData.subtitle !== undefined
          ? `\n🖋️ ${await t("Subtitle", chatId)}: ${newRepData.subtitle}\n`
          : ""
      }
      \n📋 ${await t("Please confirm the details you have provided", chatId)}
      `,
        );
      }

      break;
  }

  await clearTrash(chatId);
}
