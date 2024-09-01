import { bot } from "../bot.js";
import { trash } from "../states/state.js";

let chatId = 5117003387;

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

async function clearTrash() {
  try {
    for (let message_id of trash.getState()) {
      await bot.deleteMessage(chatId, message_id);
    }
  } catch (error) {
    console.log("Error on delete message: ", error.message);
  }
}

function formatText(text) {
  text = text
    .replace(/\.c(.*?)\.c/g, "```$1```")
    .replace(/\.b(.*?)\.b/g, "*$1*")
    .replace(/\.i(.*?)\.i/g, "_$1_")
    .replace(/\.u(.*?)\.u/g, "__$1__") // Tagiga chiziq tortish uchun .u qo'shilishi
    .replace(/\.s(.*?)\.s/g, "~$1~") // Ustiga chiziq tortish uchun .s qo'shilishi
    .replace(/\.link\((.*?),\s*(.*?)\)/g, "[$2]($1)"); // Link qo'shish funksiyasi

  // MarkdownV2 da qochirilishi kerak bo'lgan belgilar ro'yxati
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

  // Qochirilishi kerak bo'lgan belgilar uchun ishlov berish
  let escapedText = "";
  let insideCodeBlock = false;
  let insideSpecialFormatting = false;

  for (let i = 0; i < text.length; i++) {
    // Almashtirilgan kod blokini tekshirish
    if (text.slice(i, i + 3) === "```") {
      insideCodeBlock = !insideCodeBlock;
      escapedText += text.slice(i, i + 3);
      i += 2; // `i` ni uch belgiga o'tkazish
      continue;
    }

    // Qalin, qiyshaytirilgan, tagiga yoki ustiga chiziq tortilgan matnni tekshirish
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

    // Qochirilishi kerak bo'lgan belgilarni tekshirish
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

// TODO: optimize code
function addTimeStringToDate(initialDate, timeString) {
  const date = new Date(initialDate);

  // Stringni parse qilish: "2 hours", "1 day", "180hours"
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

export {
  createKeyboard,
  createInlineKeyboard,
  createState,
  clearTrash,
  formatText,
  addTimeStringToDate,
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
