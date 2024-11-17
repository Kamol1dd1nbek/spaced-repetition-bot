import { bot } from "../bot.js";
import { findUserById } from "../services/userService.js";
import { context } from "../states/state.js";
let userStates = new Map();

function createContext() {
  return {
    async getContext(chatId, propName) {
      try {
        if (userStates.has(chatId)) {
          return userStates.get(chatId).get(propName);
        }
        return null;
      } catch (error) {
        console.log(error.message);
      }
    },
    async setContext(chatId, propName, callback) {
      if (!userStates.has(chatId)) {
        const user = await findUserById(chatId);
        userStates.set(
          chatId,
          new Map(
            Object.entries({
              id: null,
              firstName: null,
              lastName: null,
              username: null,
              mainMessage: {},
              isFormated: false,
              currentAction: "",
              isRepetitioning: false,
              timeoutId: "",
              newRepetition: {},
              trash: [],
              pagination: { currentPage: 1, totalPages: 1 },
              createdDate: new Date(),
              currentLang: "en",
            }),
          ),
        );
      }
      userStates
        .get(chatId)
        .set(
          propName,
          await callback(userStates.get(chatId).get(propName) || null),
        );

      return userStates.get(chatId).get(propName);
    },
  };
}

function createState(data) {
  return {
    data: data,
    async setState(callback) {
      this.data = await callback(this.data);
      return this.data;
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

async function clearTrash(chatId, msgId) {
  try {
    if (!msgId) {
      const trash = await context.getContext(chatId, "trash");
      if (!trash) return;
      for (let message of trash) {
        try {
          await bot.deleteMessage(message.chat_id, message.message_id);
          await context.setContext(chatId, "trash", (trash) =>
            trash.filter(
              (msg) =>
                msg.chat_id !== message.chat_id &&
                msg.message_id !== message.message_id,
            ),
          );
        } catch (error) {
          console.log(error.message);
        }
      }
    } else {
      await bot.deleteMessage(chatId, msgId);
    }
  } catch (error) {
    console.log("On helpers file clearTrash function line: 110", error.message);
  }
}

function formatText(text) {
  let result = "";
  let commandsAlpha = ["b", "c", "i", "u", "s"];
  const markdownChars = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
    ",",
  ];
  for (let i = 0; i < text.length; i++) {
    if (text[i] == "." && commandsAlpha.includes(text[i + 1])) {
      result += `.${text[i++ + 1]}`;
    } else if (markdownChars.includes(text[i])) {
      result += `\\${text[i]}`;
    } else {
      result += text[i];
    }
  }
  return result
    .replace(/\.c/g, "```")
    .replace(/\.b/g, "*")
    .replace(/\.i/g, "_")
    .replace(/\.u/g, "__")
    .replace(/\.s/g, "~");
}

function addTimeStringToDate(initialDate, timeString) {
  const date = new Date(initialDate);
  const [amount, unit] = timeString.match(/(\d+)\s*(\w+)/).slice(1, 3);

  const timeAmount = parseInt(amount, 10);

  switch (unit.toLowerCase()) {
    case "day":
    case "days":
      date.setDate(date.getDate() + timeAmount);
      break;
    case "hour":
    case "hours":
      date.setHours(date.getHours() + timeAmount);
      break;
    case "minute":
    case "minutes":
      date.setMinutes(date.getMinutes() + timeAmount);
      break;
    default:
      throw new Error("Invalid time unit provided.");
  }

  return date.toISOString();
}

function createPaginationBtns(currentPage, totalPages) {
  return [
    {
      text: "⬅️",
      callback_data: currentPage - 1 > 0 ? `page_${currentPage - 1}` : "noop",
    },
    {
      text: `${currentPage}/${totalPages}`,
      callback_data: "noop",
    },
    {
      text: "➡️",
      callback_data:
        currentPage + 1 <= totalPages ? `page_${currentPage + 1}` : "noop",
    },
  ];
}

function splitArray(arr) {
  const length = arr.length;
  if (length <= 5) {
    return [arr];
  }
  const middle = Math.ceil(length / 2);
  const firstPart = arr.slice(0, middle);
  const secondPart = arr.slice(middle);

  return [firstPart, secondPart];
}

function getTimeDifferenceInMilliseconds(time1, time2) {
  const date1 = new Date(time1);
  const date2 = new Date(time2);

  const difference = date2 - date1;

  return difference;
}

export {
  createKeyboard,
  createInlineKeyboard,
  createState,
  clearTrash,
  formatText,
  addTimeStringToDate,
  createPaginationBtns,
  splitArray,
  getTimeDifferenceInMilliseconds,
  createContext,
};
