import TelegramBot from "node-telegram-bot-api";
import config from "./environment/config.js";
import onMessage from "./handlers/messages.js";
import onCallbackQuery from "./handlers/callbacks.js";

const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

onMessage(bot);
onCallbackQuery(bot);
