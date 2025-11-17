import express from "express";
import { Bot } from "unibot";

const app = express();
app.use(express.json());

// Initialize bot with Telegram and Discord configs
const bot = new Bot({
  telegram: {
    botToken: process.env.TG_TOKEN!,
    webhookPath: "/webhook/telegram",
  },
  discord: {
    token: process.env.DISCORD_TOKEN!,
  },
});

// Register message handler
bot.on("message", async (ctx) => {
  // Reply "hi" from both channels
  await ctx.reply({ type: "text", text: `Hello from ${ctx.channel}!` });
});

// Start adapters (Discord: opens gateway WS)
await bot.start();

// Wire Telegram webhook into Express
const tg = bot.requireTelegram();
app.post(tg.webhook.path, async (req, res) => {
  await tg.webhook.handler(req.body, req.headers as Record<string, string>);
  res.sendStatus(200);
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Telegram webhook: http://localhost:${PORT}${tg.webhook.path}`);
});

