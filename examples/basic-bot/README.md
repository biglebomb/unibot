# Basic Bot Example

This example demonstrates how to use unibot with both Telegram and Discord channels.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables:
   ```bash
   export TG_TOKEN="your-telegram-bot-token"
   export DISCORD_TOKEN="your-discord-bot-token"
   ```

3. Run the server:
   ```bash
   bun run dev
   ```

## Telegram Setup

1. Create a bot using [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Set up webhook (replace with your public URL):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-domain.com/webhook/telegram"
   ```

## Discord Setup

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot and copy the token
3. Invite the bot to your server with appropriate permissions

## Usage

- Send a message to your Telegram bot - it will reply "Hello from telegram!"
- Send a message to your Discord bot - it will reply "Hello from discord!"

