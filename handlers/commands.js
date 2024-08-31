import sendMessage from "../modules/sendMessage.js";
import { createKeyboard } from "../utils/helpers.js";

export default async function onCommand(msg) {
  switch (msg.text) {
    case "/start":
      sendMessage(
        msg.chat.id,
        `Welcome ${msg.chat.first_name} 🎉\nDont stop learning ✊`,
        createKeyboard([["➕ Add new"]])
      );
      break;
  }
}
