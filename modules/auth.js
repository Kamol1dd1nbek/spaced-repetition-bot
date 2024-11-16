import config from "../environment/config.js";
import t from "../langs/index.js";
import setReminder from "./setReminder.js";

function isAuthorized(chatId) {
  return config.ALLOWED_CHAT_IDs.includes(chatId);
}

export default function authMiddleware(chatId, msg, callback) {
  if (!isAuthorized(chatId)) {
    // action on no access
    return 1;
  }

  setReminder(chatId);
  callback(msg);
}
