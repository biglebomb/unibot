# Unibot

> **Note:** "unibot" is a working name and may change before publication.

TypeScript-first SDK for building multi-channel chatbots. Build bots for Telegram and Discord (and more channels coming) in one codebase.

## Features

- 🚀 **TypeScript-first** - Full type safety and excellent DX
- 🔌 **Multi-channel** - Support for Telegram and Discord (more coming)
- 🎯 **Framework-agnostic** - Works with Express, Fastify, Nest, Next.js, or any HTTP server
- 📦 **Simple API** - Clean, developer-friendly interface
- 🔄 **Webhook + WebSocket** - Supports both webhook (Telegram) and WebSocket (Discord) adapters

## Installation

```bash
bun add unibot
```

## Quick Start

```typescript
import { Bot } from "unibot";

const bot = new Bot({
  telegram: {
    botToken: process.env.TG_TOKEN!,
    webhookPath: "/webhook/telegram", // optional
  },
  discord: {
    token: process.env.DISCORD_TOKEN!,
  },
});

// Register message handler
bot.on("message", async (ctx) => {
  await ctx.reply({
    content: { type: "text", text: `Hello from ${ctx.channel}!` },
  });
});

// Start adapters (Telegram: no-op except attachCore, Discord: opens gateway WS)
await bot.start();

// Wire Telegram webhook into Express (or any HTTP framework)
const tg = bot.requireTelegram();

app.post(tg.webhook.path, async (req, res) => {
  await tg.webhook.handler(req.body, req.headers);
  res.sendStatus(200);
});
```

## API Reference

### Bot Class

#### Constructor

```typescript
new Bot(config: BotConfig)
```

Creates a new bot instance with the provided configuration.

#### Methods

- `on(eventType: IncomingEventType, handler: EventHandler)` - Register an event handler
- `start(): Promise<void>` - Start all adapters (calls `start()` on WebSocket-based adapters)
- `requireTelegram(): TelegramAdapter` - Get Telegram adapter (throws if not configured)
- `requireDiscord(): BotAdapter` - Get Discord adapter (throws if not configured)

### Context

The context object passed to event handlers provides:

- `channel: ChannelName` - The channel the event came from
- `userId: string` - External user ID
- `chatId: string | undefined` - External chat/channel ID
- `text: string | undefined` - Message text (if applicable)
- `raw: unknown` - Raw event data from the adapter
- `reply(msg: Message): Promise<void>` - Reply to the message

### Message Types

#### Message

The new message format separates content from interactive components:

```typescript
interface Message {
  content?: Content; // Optional (some channels allow components without content)
  components?: MessageComponent[]; // Array of components (buttons, selects, etc.)
}

type Content = TextContent | ImageContent;

interface TextContent {
  type: "text";
  text: string;
}

interface ImageContent {
  type: "image";
  url: string;
  caption?: string;
}

interface ButtonComponent {
  type: "button";
  id: string;
  label: string;
  style?: "primary" | "secondary" | "success" | "danger" | "link";
  url?: string; // For link buttons
}

type MessageComponent = ButtonComponent;
```

**Example usage:**

```typescript
// Text message
await ctx.reply({
  content: { type: "text", text: "Hello!" },
});

// Image with caption
await ctx.reply({
  content: {
    type: "image",
    url: "https://example.com/image.jpg",
    caption: "Check this out!",
  },
});

// Text with buttons
await ctx.reply({
  content: { type: "text", text: "Choose an option:" },
  components: [
    { type: "button", id: "opt1", label: "Option 1" },
    { type: "button", id: "opt2", label: "Option 2" },
  ],
});
```

#### IncomingEvent

```typescript
interface IncomingEvent {
  channel: ChannelName;
  type: IncomingEventType;
  externalUserId: string;
  externalChatId?: string;
  text?: string;
  raw: unknown;
}
```

## Configuration

### Telegram

1. Create a bot using [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Set up webhook pointing to your server's webhook path

### Discord

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot and copy the token
3. Invite the bot to your server with appropriate permissions

## Development

### Setup

```bash
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format
```

### Project Structure

```
src/
  core/          # Core bot logic, types, context, router
  adapters/      # Channel-specific adapters
    telegram/    # Telegram webhook adapter
    discord/     # Discord websocket adapter
  index.ts       # Public API exports
tests/           # Vitest test files
examples/        # Example implementations
```

## Examples

See the [basic-bot example](./examples/basic-bot/) for a complete integration with Express.

## Roadmap (v1)

- [x] Full button support (inline keyboards for Telegram, components for Discord)
- [x] Message architecture with content/component abstraction
- [x] More event types (reactions, joins)
- [ ] State management/store
- [ ] Message persistence
- [ ] Additional channels (Slack, WhatsApp, etc.)

## License

MIT

