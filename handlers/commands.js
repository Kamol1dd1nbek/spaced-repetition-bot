import { createKeyboard, sendMessage } from "../utils/helpers.js";

export default async function onCommand(msg) {
  switch (msg.text) {
    case "/start":
      sendMessage(
        `Welcome ${msg.chat.first_name} 🎉\nDont stop learning ✊`,
        createKeyboard([["➕ Add new"]])
      );
      break;
  }
}
