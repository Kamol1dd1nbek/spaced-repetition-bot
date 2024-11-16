import { context } from "../states/state.js";
import { bot } from "../bot.js";

export default async function sendMediaMessage(
  chatId,
  repetition,
  options,
  caption,
) {
  const mainMsg = await context.getContext(chatId, "mainMessage");

  try {
    if (Object.keys(mainMsg ? mainMsg : {}).length) {
      try {
        await bot.deleteMessage(chatId, mainMsg.message_id);
      } catch (error) {
        console.log(
          "On deleting main message at sendMediaMessage.js line:18",
          error.message,
        );
      }
    }

    const sendFunction = {
      photo: bot.sendPhoto,
      video: bot.sendVideo,
      voice: bot.sendVoice,
      document: bot.sendDocument,
    }[repetition.type];

    if (!sendFunction) throw new Error("Wrong media type!");

    const sentMessage = await sendFunction.call(
      bot,
      chatId,
      repetition.fileId,
      {
        parse_mode: "MarkdownV2",
        caption,
        ...options,
      },
    );
    await context.setContext(chatId, "mainMessage", () => sentMessage);
  } catch (error) {
    console.log("On sendMediaMessage.js line:45 -->", error.message);
  }
}
