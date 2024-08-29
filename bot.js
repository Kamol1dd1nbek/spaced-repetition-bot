import TelegramBot from "node-telegram-bot-api";
import config from "./environment/config.js";
import {
  onCommand,
  onMessage,
  onCallbackQuery,
  onEditMessage,
} from "./handlers/index.js";
import connectDB from "./services/db.js";

export const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

// connect to database
connectDB(config.CONNECTION);

bot.onText(/\/.*/, (msg) => onCommand(msg));
bot.on("message", (msg) => onMessage(msg));
bot.on("callback_query", (callbackQuery) => onCallbackQuery(callbackQuery));
bot.on("edited_message", (editedMessage) => onEditMessage(editedMessage));
bot.on("polling_error", (error) => {
  console.log(`Polling error: ${error.message}`);
});

console.log("Bot is running");
