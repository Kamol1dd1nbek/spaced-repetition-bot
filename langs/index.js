import { context } from "../states/state.js";
import uz from "./uz.json" assert { type: "json" };
import en from "./en.json" assert { type: "json" };
import ru from "./ru.json" assert { type: "json" };

let resources = {
  uz,
  en,
  ru,
};

async function t(key, chatId) {
  let currentLang = await context.getContext(chatId, "currentLang");

  if (!currentLang || !["uz", "en", "ru"].includes(currentLang))
    currentLang = "en";
  return resources[currentLang][key];
}

export default t;
