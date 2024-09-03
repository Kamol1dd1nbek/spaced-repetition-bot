import { getNextRepetition } from "../services/repetitionService.js";
import {
  context,
  isFormated,
  isRepetitioning,
  timeoutId,
} from "../states/state.js";
import {
  createInlineKeyboard,
  getTimeDifferenceInMilliseconds,
} from "../utils/helpers.js";
import sendMessage from "./sendMessage.js";

async function setReminder(chatId) {
  let tId = await context.getContext(chatId, "timeoutId");
  // let tId = await timeoutId.getState();
  if (tId) clearInterval(tId);
  const nextRepetition = await getNextRepetition(chatId);

  if (nextRepetition) {
    tId = setTimeout(async () => {
      if (!(await context.getContext(chatId, "isRepetitioning"))) {
        await context.setContext(chatId, "isFormated", () => true);
        // await isFormated.setState(() => true);
        await context.setContext(chatId, "isRepetitioning", () => true);
        // isRepetitioning.setState(() => true);
        await sendMessage(
          `
    🧠 Repeat this:
            
    📌 Title: *${nextRepetition.title}*
    ${
      nextRepetition.subtitle !== undefined
        ? `\n🖋️ Subtitle: ${nextRepetition.subtitle}\n`
        : ""
    }
    📜 Body:\n
    ${nextRepetition.body}
            `,
          chatId,
          {
            ...createInlineKeyboard([
              [
                {
                  text: "❌ False",
                  callback_data: `false_${nextRepetition._id}`,
                },
                {
                  text: "✅ True",
                  callback_data: `true_${nextRepetition._id}`,
                },
              ],
              [
                {
                  text: "🔄 Again",
                  callback_data: `again_${nextRepetition._id}`,
                },
                {
                  text: "😎 Easy",
                  callback_data: `easy_${nextRepetition._id}`,
                },
                {
                  text: "📋 Others",
                  callback_data: `get_list`,
                },
              ],
            ]),
          }
        );
        setReminder(chatId);
      }
    }, getTimeDifferenceInMilliseconds(new Date(), nextRepetition.nextRepetition));

    await context.setContext(chatId, "timeoutId", () => tId);
    // timeoutId.setState(() => tId);
  }
}

export default setReminder;
