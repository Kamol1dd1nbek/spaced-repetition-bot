import config from "../environment/config.js";
import setReminder from "./setReminder.js";

function isAuthorized(chatId) {
  return config.ALLOWED_CHAT_IDs.includes(chatId);
}

export default function authMiddleware(chatId, msg, callback) {
  setReminder(chatId);
  
  if (!isAuthorized(chatId)) {
    // action on no access
    return 1;
  }

  callback(msg);
}
