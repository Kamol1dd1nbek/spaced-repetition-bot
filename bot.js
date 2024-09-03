import TelegramBot from "node-telegram-bot-api";
import config from "./environment/config.js";
import {
  onCommand,
  onMessage,
  onCallbackQuery,
  onEditMessage,
} from "./handlers/index.js";
import { authMiddleware } from "./modules/index.js";
import { connectDB } from "./services/index.js";

export const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// connect to database
connectDB(config.CONNECTION);

bot.onText(/\/.*/, (msg) => {
  // console.log(msg.chat.id);
  authMiddleware(msg.chat.id, msg, onCommand)
});
bot.on("message", (msg) => authMiddleware(msg.chat.id, msg, onMessage));
bot.on("callback_query", (callbackQuery) =>
  authMiddleware(callbackQuery.message.chat.id, callbackQuery, onCallbackQuery)
);
bot.on("edited_message", (editedMessage) =>
  authMiddleware(editedMessage.chat.id, editedMessage, onEditMessage)
);
bot.on("polling_error", (error) => {
  console.log(`Polling error: ${error.message}`);
});

console.log("Bot is running");
