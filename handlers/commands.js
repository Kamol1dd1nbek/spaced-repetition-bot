import User from "../models/User.js";
import sendMessage from "../modules/sendMessage.js";
import { findUserById } from "../services/userService.js";
import { createInlineKeyboard } from "../utils/helpers.js";

export default async function onCommand(msg) {
  switch (msg.text) {
    case "/start":
      let user = await findUserById(msg.chat.id);
      if (!user) {
        await new User({
          id: msg.chat.id,
          firstName: msg.chat.first_name,
          lastName: msg.chat?.last_name,
          username: msg.chat?.username,
        }).save();
      }

      sendMessage(
        `Welcome ${msg.chat.first_name} 🎉\nDont stop learning ✊`,
        msg.chat.id,
        {
          ...createInlineKeyboard([
            [
              {
                text: "Continue",
                callback_data: "get_list",
              },
            ],
          ]),
        }
      );
      break;
  }
}
