import { bot } from "../bot.js";
import config from "../environment/config.js";
import t from "../langs/index.js";
import archiveMedia from "../modules/archiveMedia.js";
import sendMessage from "../modules/sendMessage.js";
import { context } from "../states/state.js";
import {
  clearTrash,
  createInlineKeyboard,
  createKeyboard,
  formatText,
} from "../utils/helpers.js";

export default async function onMessage(msg) {
  const chatId = msg.chat.id;
  let text = msg?.text;
  // let type;
  // // check type
  // switch (true) {
  //   case msg?.photo !== undefined:
  //     type = "photo";
  //     break;
  //   case msg?.voice !== undefined:
  //     type = "voice";
  //     break;
  //   case msg?.text !== undefined:
  //     type = "text";
  //     break;
  // }

  // if (!["photo", "voice", "text"].includes(type)) {
  //   return sendMessage(
  //     (await t(
  //       "Sorry, the data type you submitted is not currently supported",
  //       chatId
  //     )) + " 😕❗",
  //     chatId
  //   );
  // }
  // return console.log(type);

  // const sentPhoto = await bot.sendPhoto(config.CHANNEL_ID, msg.photo[0].file_id);
  // console.log(sentPhoto); // bu kanaldagi rasmning  id si
  // kanalga yuborilgan habar ma'lumotlari olindi endi uni reetition ga qo'shib qo'yich kerak

  await context.setContext(chatId, "trash", (trash) => [
    ...trash,
    { chat_id: chatId, message_id: msg.message_id },
  ]);
  let newRepData = await context.getContext(chatId, "newRepetition");

  switch (await context.getContext(chatId, "currentAction")) {
    case "addTitle":
      if (text.trim() === "") {
        return sendMessage("⚠️ Title cannot be empty", chatId);
      }
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
        }
      );
      await context.setContext(chatId, "currentAction", () => "addSubtitle");
      break;

    case "addSubtitle":
      if (text !== ".") {
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, subtitle: formatText(text) };
        });
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
      break;

    case "addBody":
      let type;
      switch (true) {
        case msg?.photo !== undefined:
          type = "photo";
          break;
        case msg?.voice !== undefined:
          type = "voice";
          break;
        case msg?.text !== undefined:
          type = "text";
          break;
      }

      if (!["photo", "voice", "text"].includes(type)) {
        return sendMessage(
          (await t(
            "Sorry, the data type you submitted is not currently supported",
            chatId
          )) + " 😕❗",
          chatId
        );
      }

      if (type !== "text") {
        let archId = await archiveMedia(
          msg[type].file_id || msg[type][1].file_id,
          type
        );
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, fileId: archId };
        });
        await context.setContext(chatId, "newRepetition", (prevRepetition) => {
          return { ...prevRepetition, type };
        });
        await context.setContext(
          chatId,
          "currentAction",
          () => "checkAddBodyText"
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
          }
        );
      } send Message funksiyasini to'g'irlab, qayta ko'rib chiqish kerak, unga type va fil eid ham berib yuborish kerak, caption bor yoki yo'q ekanligni ham tekshirish kerak

      //       if (text.trim() === "") {
      //         return sendMessage("⚠️ Body cannot be empty", chatId);
      //       }
      //       await context.setContext(chatId, "newRepetition", (prevRepetition) => {
      //         return { ...prevRepetition, bodyText: formatText(text) };
      //       });
      //       newRepData = await context.getContext(chatId, "newRepetition");
      //       await clearTrash(chatId);
      //       await context.setContext(chatId, "isFormated", () => true);
      //       sendMessage(
      //         `
      // 📋 ${await t("Please confirm the details you have provided", chatId)}:

      // 📌 ${await t("Title", chatId)}: *${newRepData.title}*
      // ${
      //   newRepData.subtitle !== undefined
      //     ? `\n🖋️ ${await t("Subtitle", chatId)}: ${newRepData.subtitle}\n`
      //     : ""
      // }
      // 📜 ${await t("Body", chatId)}:\n
      // ${newRepData.bodyText}
      // `,
      //         chatId,
      //         {
      //           ...createKeyboard([["Add"]]),
      //           ...createInlineKeyboard([
      //             [
      //               {
      //                 text: `❌ ${await t("Cancel", chatId)}`,
      //                 callback_data: "cencel_adding",
      //               },
      //               {
      //                 text: `✏️ ${await t("Edit", chatId)}`,
      //                 web_app: { url: "https://github.com/Kamol1dd1nbek" },
      //               },
      //               {
      //                 text: `✅ ${await t("Confirm", chatId)}`,
      //                 callback_data: "confirm_adding",
      //               },
      //             ],
      //           ]),
      //         }
      //       );
      //       await context.setContext(chatId, "currentAction", () => "checkNewRep");
      break;

    case "addBodyText":
      break;
  }

  await clearTrash(chatId);
}
