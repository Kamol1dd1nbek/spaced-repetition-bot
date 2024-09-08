import User from "../models/User.js";
import sendMessage from "../modules/sendMessage.js";
import { findUserById } from "../services/userService.js";
import { context } from "../states/state.js";
import { createInlineKeyboard } from "../utils/helpers.js";

export default async function onCommand(msg) {
  let user;
  let chatId = msg.chat.id;

  switch (msg.text) {
    case "/start":
      user = await findUserById(msg.chat.id);
      if (!user) {
        await new User({
          id: msg.chat.id,
          firstName: msg.chat.first_name,
          lastName: msg.chat?.last_name,
          username: msg.chat?.username,
        }).save();
      }
      await context.setContext(chatId, "isFormated", () => true);

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

    case "/help":
      const helpMessage = `
<b>Hello!</b> I'm here to assist you. Below are the available commands and text formatting instructions for this bot:

/start - Start the bot and receive a welcome message.
/help - View this help message.

Text formatting guide:
- Use \`.b\`  to make text <b>bold</b>.
- Use \`.i\`   to <i>italic</i>.
- Use \`.u\`  to <u>underlined</u>.
- Use \`.c\`  to <code>code block</code>.
- Use \`.s\`  to <s>strikethrough</s> text.
  `;

      sendMessage(helpMessage, chatId, {
        parse_mode: "HTML",
        ...createInlineKeyboard([
          [
            {
              text: "Continue",
              callback_data: "get_list",
            },
          ],
        ]),
      });
      break;
  }
}
