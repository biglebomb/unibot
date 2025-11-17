import {
  Client,
  GatewayIntentBits,
  type Message,
  type TextChannel,
} from "discord.js";
import type {
  DiscordConfig,
  BotAdapter,
  CoreEventHandler,
  OutgoingMessage,
} from "../../core/types.js";
import { mapDiscordMessageToEvent } from "./mapping.js";

export function createDiscordAdapter(config: DiscordConfig): BotAdapter {
  let coreHandler: CoreEventHandler | undefined;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Set up message handler
  client.on("messageCreate", async (message: Message) => {
    if (!coreHandler) {
      return;
    }

    const event = mapDiscordMessageToEvent(message);
    if (event) {
      await coreHandler(event);
    }
  });

  const adapter: BotAdapter = {
    name: "discord",
    attachCore(handler: CoreEventHandler): void {
      coreHandler = handler;
    },
    async start(): Promise<void> {
      await client.login(config.token);
    },
    async send(
      msg: OutgoingMessage,
      meta: {
        channel: "discord";
        externalUserId: string;
        externalChatId?: string;
      }
    ): Promise<void> {
      const channelId = meta.externalChatId || meta.externalUserId;
      const channel = (await client.channels.fetch(channelId)) as
        | TextChannel
        | null;

      if (!channel || !channel.isTextBased()) {
        throw new Error(`Channel ${channelId} not found or not a text channel`);
      }

      if (msg.type === "text") {
        await channel.send(msg.text);
      } else if (msg.type === "image") {
        // TODO: Implement image sending with caption in v1
        await channel.send({
          content: msg.caption || "",
          files: [msg.url],
        });
      } else if (msg.type === "buttons") {
        // TODO: Implement button components in v1
        // For now, send text only
        await channel.send(msg.text);
      }
    },
  };

  return adapter;
}

