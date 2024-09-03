import { bot } from "../bot.js";
import { findUserById } from "../services/userService.js";
import { context, trash } from "../states/state.js";

function createContext() {
  return {
    async getContext(chatId, propName) {
      // console.log(chatId, "-----cr contex");

      try {
        let user = await findUserById(chatId);
        // console.log(user, "-----cr contex");
        if (user && propName in user) return user[propName];
        else return undefined;
      } catch (error) {
        console.log(error.message);
      }
    },
    async setContext(chatId, propName, callback) {
      let user = await findUserById(chatId);
      if (user) {
        user[propName] = await callback(user[propName]);
        return await user.save();
      }
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

async function clearTrash(chatId) {
  const trash = await context.getContext(chatId, "trash");
  if (!trash) return;
  for (let message of trash) {
    try {
      await bot.deleteMessage(message.chat_id, message.message_id);
      await context.setContext(chatId, "trash", (trash) =>
        trash.filter(
          (msg) =>
            msg.chat_id !== message.chat_id &&
            msg.message_id !== message.message_id
        )
      );

      // await trash.setState((prev) =>
      //   prev.filter(
      //     (msg) =>
      //       msg.chat_id !== message.chat_id &&
      //       msg.message_id !== message.message_id
      //   )
      // );
    } catch (error) {
      console.log(error.message);
    }
  }
}

function formatText(text) {
  text = text
    .replace(/\.c(.*?)\.c/g, "```$1```")
    .replace(/\.b(.*?)\.b/g, "*$1*")
    .replace(/\.i(.*?)\.i/g, "_$1_")
    .replace(/\.u(.*?)\.u/g, "__$1__")
    .replace(/\.s(.*?)\.s/g, "~$1~")
    .replace(/\.link\((.*?),\s*(.*?)\)/g, "[$2]($1)");

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

  let escapedText = "";
  let insideCodeBlock = false;
  let insideSpecialFormatting = false;

  for (let i = 0; i < text.length; i++) {
    if (text.slice(i, i + 3) === "```") {
      insideCodeBlock = !insideCodeBlock;
      escapedText += text.slice(i, i + 3);
      i += 2;
      continue;
    }

    if (
      text[i] === "*" ||
      text[i] === "_" ||
      text[i] === "`" ||
      text[i] === "~"
    ) {
      insideSpecialFormatting = !insideSpecialFormatting;
      escapedText += text[i];
      continue;
    }

    if (
      markdownChars.includes(text[i]) &&
      !insideCodeBlock &&
      !insideSpecialFormatting
    ) {
      escapedText += "\\" + text[i];
    } else {
      escapedText += text[i];
    }
  }

  return escapedText;
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
      callback_data: `page_${currentPage - 1 > 0 ? currentPage - 1 : 1}`,
    },
    {
      text: `${currentPage}/${totalPages}`,
      callback_data: "noop",
    },
    {
      text: "➡️",
      callback_data: `page_${
        currentPage + 1 <= totalPages ? currentPage + 1 : totalPages
      }`,
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
