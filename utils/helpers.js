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
  const commandsMap = {
    ".b": "*",   // bold
    ".i": "_",   // italic
    ".u": "__",  // underline
    ".s": "~",   // strikethrough
    ".c": "```"  // code block
  };

  const markdownChars = [
    "_", "*", "[", "]", "(", ")", "~", "`", ">", "#",
    "+", "-", "=", "|", "{", "}", ".", "!", ","
  ];

  // 1. Escape markdown chars (including dot), but skip when it’s a standalone format code surrounded by spaces
  let escaped = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    const isFormatCode =
      char === '.' &&
      i + 1 < text.length &&
      commandsMap.hasOwnProperty(`.${text[i + 1]}`) &&
      ((i - 1 < 0 || text[i - 1] === ' ') && (i + 2 >= text.length || text[i + 2] === ' '));

    if (markdownChars.includes(char) && !isFormatCode) {
      escaped += `\\${char}`;
    } else {
      escaped += char;
    }
  }

  // 2. Replace format commands only if surrounded by real spaces
  for (const [cmd, symbol] of Object.entries(commandsMap)) {
    const regex = new RegExp(`(?<=\\s)\\${cmd}(?=\\s)`, 'g');
    escaped = escaped.replace(regex, ` ${symbol} `);
  }

  // 3. Remove extra spaces inside format marks
  escaped = escaped.replace(/\*\s+/g, '*')
                   .replace(/\s+\*/g, '*')
                   .replace(/_\s+/g, '_')
                   .replace(/\s+_/g, '_')
                   .replace(/__\s+/g, '__')
                   .replace(/\s+__/g, '__')
                   .replace(/~\s+/g, '~')
                   .replace(/\s+~/g, '~')
                   .replace(/```(\s+)?/g, '```');

  return escaped;
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
