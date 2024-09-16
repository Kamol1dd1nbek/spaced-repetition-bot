import { bot } from "../bot.js";
import config from "../environment/config.js";

async function archiveMedia(fileId, type) {
  const chatId = config.CHANNEL_ID;
  let archId;

  if (type === "photo") {
    archId = (await bot.sendPhoto(chatId, fileId)).photo[1].file_id;
  } else if (type === "voice") {
    archId = (await bot.sendVoice(chatId, fileId)).voice.file_id;
  }

  return archId;
}

export default archiveMedia;
