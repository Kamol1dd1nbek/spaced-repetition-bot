export default async function onMessage(bot) {
  bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, msg.text)
  })
}