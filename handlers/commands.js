import sendMessage from "../modules/sendMessage.js";
import { mainMessage } from "../states/state.js";
import { createKeyboard } from "../utils/helpers.js";

export default async function onCommand(msg) {
  switch (msg.text) {
    case "/start":
      await mainMessage.setState(() => msg.message_id);
      sendMessage(
        msg.chat.id,
        `Welcome ${msg.chat.first_name} 🎉\nDont stop learning ✊`
      );
      break;
  }
}
