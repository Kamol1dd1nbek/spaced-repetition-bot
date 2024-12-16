import { context } from "../states/state.js";
// import uz from "./uz.json" assert { type: "json" };
// import en from "./en.json" assert { type: "json" };
// import ru from "./ru.json" assert { type: "json" };

import fs from "fs";

const uz = JSON.parse(fs.readFileSync("./langs/uz.json", "utf-8"));
const en = JSON.parse(fs.readFileSync("./langs/en.json", "utf-8"));
const ru = JSON.parse(fs.readFileSync("./langs/ru.json", "utf-8"));

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
