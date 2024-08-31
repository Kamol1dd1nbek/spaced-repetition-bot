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

function formatText1(text) {
  // Birinchi bosqich: .c, .b, .i, .u va .s ni almashtirish
  text = text.replace(/\.c(.*?)\.c/g, '```$1```')
             .replace(/\.b(.*?)\.b/g, '*$1*')
             .replace(/\.i(.*?)\.i/g, '_$1_')
             .replace(/\.u(.*?)\.u/g, '__$1__')   // Tagiga chiziq tortish uchun .u qo'shilishi
             .replace(/\.s(.*?)\.s/g, '~$1~');    // Ustiga chiziq tortish uchun .s qo'shilishi

  // MarkdownV2 da qochirilishi kerak bo'lgan belgilar ro'yxati
  const markdownChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!', ','];

  // Qochirilishi kerak bo'lgan belgilar uchun ishlov berish
  let escapedText = '';
  let insideCodeBlock = false;
  let insideSpecialFormatting = false;

  for (let i = 0; i < text.length; i++) {
      // Almashtirilgan kod blokini tekshirish
      if (text.slice(i, i + 3) === '```') {
          insideCodeBlock = !insideCodeBlock;
          escapedText += text.slice(i, i + 3);
          i += 2; // `i` ni uch belgiga o'tkazish
          continue;
      }

      // Qalin, qiyshaytirilgan, tagiga yoki ustiga chiziq tortilgan matnni tekshirish
      if (text[i] === '*' || text[i] === '_' || text[i] === '`' || text[i] === '~') {
          insideSpecialFormatting = !insideSpecialFormatting;
          escapedText += text[i];
          continue;
      }

      // Qochirilishi kerak bo'lgan belgilarni tekshirish
      if (markdownChars.includes(text[i]) && !insideCodeBlock && !insideSpecialFormatting) {
          escapedText += '\\' + text[i];
      } else {
          escapedText += text[i];
      }
  }

  return escapedText;
}

function formatText(text) {
  // Birinchi bosqich: .c, .b, .i, .u, .s va link almashtirishni qo'llash
  text = text.replace(/\.c(.*?)\.c/g, '```$1```')
             .replace(/\.b(.*?)\.b/g, '*$1*')
             .replace(/\.i(.*?)\.i/g, '_$1_')
             .replace(/\.u(.*?)\.u/g, '__$1__')   // Tagiga chiziq tortish uchun .u qo'shilishi
             .replace(/\.s(.*?)\.s/g, '~$1~')     // Ustiga chiziq tortish uchun .s qo'shilishi
             .replace(/\.link\((.*?),\s*(.*?)\)/g, '[$2]($1)'); // Link qo'shish funksiyasi

  // MarkdownV2 da qochirilishi kerak bo'lgan belgilar ro'yxati
  const markdownChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!', ','];

  // Qochirilishi kerak bo'lgan belgilar uchun ishlov berish
  let escapedText = '';
  let insideCodeBlock = false;
  let insideSpecialFormatting = false;

  for (let i = 0; i < text.length; i++) {
      // Almashtirilgan kod blokini tekshirish
      if (text.slice(i, i + 3) === '```') {
          insideCodeBlock = !insideCodeBlock;
          escapedText += text.slice(i, i + 3);
          i += 2; // `i` ni uch belgiga o'tkazish
          continue;
      }

      // Qalin, qiyshaytirilgan, tagiga yoki ustiga chiziq tortilgan matnni tekshirish
      if (text[i] === '*' || text[i] === '_' || text[i] === '`' || text[i] === '~') {
          insideSpecialFormatting = !insideSpecialFormatting;
          escapedText += text[i];
          continue;
      }

      // Qochirilishi kerak bo'lgan belgilarni tekshirish
      if (markdownChars.includes(text[i]) && !insideCodeBlock && !insideSpecialFormatting) {
          escapedText += '\\' + text[i];
      } else {
          escapedText += text[i];
      }
  }

  // Formatlangan matnni spoilerga o'rash
  return `||${escapedText}||`;
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
