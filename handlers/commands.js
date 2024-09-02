import { bot } from "../bot.js";
import sendMessage from "../modules/sendMessage.js";
import { createInlineKeyboard } from "../utils/helpers.js";

export default async function onCommand(msg) {
  switch (msg.text) {
    case "/start":
      sendMessage(
        `Welcome ${msg.chat.first_name} 🎉\nDont stop learning ✊`,
        msg.chat.id,
        {
          ...createInlineKeyboard([
            [
              {
                text: "➕ Add new",
                callback_data: "add_new",
              },
            ],
          ]),
        }
      );
      break;
  }
}
