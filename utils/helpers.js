import { bot } from "../bot.js";
import { trash } from "../states/state.js";

let chatId = 5117003387;

function createState(data) {
  return {
    data: data,
    setState(callback) {
      this.data = callback(this.data);
    },
    getState() {
      return this.data;
    },
  };
}

function createKeyboard(buttons, options = {}) {
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: true,
      ...options,
    },
  };
}

function createInlineKeyboard(buttons) {
  return {
    reply_markup: {
      inline_keyboard: [...buttons],
    },
  };
}

async function sendMessage(msg, options) {
  let sentMessage = await bot.sendMessage(chatId, msg, {
    parse_mode: "MarkdownV2",
    ...options,
  });
  trash.setState((prev) => [...prev, sentMessage.message_id]);
}

async function clearTrash() {
  try {
    for (let message_id of trash.getState()) {
      await bot.deleteMessage(chatId, message_id);
    }
  } catch (error) {
    console.log("Error on delete message: ", error.message);
  }
}

async function formatText(text) {
  return text.replace(/\.ol([\s\S]*?)\.\/ol/g, (match, content) => {
    // is not working
    const listItems = content.match(/\.li([\s\S]*?)\.\/li/g);
    if (listItems) {
      return listItems
        .map((item, index) => {
          // Replace .li with the numbered item
          return `${index + 1}. ${item.replace(/\.li|\.\/li/g, "").trim()}`;
        })
        .join("\n");
    }
    return match;
  });
  return text

  return text
    .replace(/\.c/g, "```")
    .replace(/\.b/g, "*")
    .replace(/\.i/g, "_")
    .replace(/\.q/g, ">")
    .replace(/\.n/g, "\\* ");
}

export {
  createKeyboard,
  createInlineKeyboard,
  sendMessage,
  createState,
  clearTrash,
  formatText,
};

// * (qalin)
// _ (yupqa)
// [ (havola)
// ] (havola)
// ( (ichiga olish)
// ) (ichiga olish)
// ~ (o'chirish chizig'i)
// > (iqtibos)
// # (sarlavha)
// + (ro'yxat)
// - (ro'yxat)
// = (sarlavha)
// | (maxfiy matn)
// . (ro'yxat)
