import {
  Client,
  GatewayIntentBits,
  type Message,
  type TextChannel,
  type Interaction,
  type MessageReaction,
  type GuildMember,
} from "discord.js";
import type {
  DiscordConfig,
  BotAdapter,
  CoreEventHandler,
  OutgoingMessage,
} from "../../core/types.js";
import {
  mapDiscordMessageToEvent,
  mapDiscordInteractionToEvent,
  mapDiscordReactionToEvent,
  mapDiscordJoinToEvent,
} from "./mapping.js";
import { DiscordMessageRenderer } from "./renderer.js";
import { convertOutgoingMessageToMessage } from "../../core/message/converter.js";

export function createDiscordAdapter(config: DiscordConfig): BotAdapter {
  let coreHandler: CoreEventHandler | undefined;
  const renderer = new DiscordMessageRenderer();
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
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

  // Set up interaction handler for button clicks
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!coreHandler) {
      return;
    }

    // Acknowledge button interactions immediately (Discord requires this)
    if (interaction.isButton()) {
      await interaction.deferUpdate();
    }

    const event = mapDiscordInteractionToEvent(interaction);
    if (event) {
      await coreHandler(event);
    }
  });

  // Set up reaction handler
  client.on("messageReactionAdd", async (reaction, user) => {
    if (!coreHandler || user.bot) {
      return;
    }

    // Only handle full MessageReaction, not PartialMessageReaction
    if (reaction.partial) {
      await reaction.fetch();
    }

    const event = mapDiscordReactionToEvent(reaction as MessageReaction, user.id);
    if (event) {
      await coreHandler(event);
    }
  });

  // Set up guild member add handler (join events)
  client.on("guildMemberAdd", async (member: GuildMember) => {
    if (!coreHandler) {
      return;
    }

    const event = mapDiscordJoinToEvent(member);
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

      // Convert legacy OutgoingMessage to Message format
      const message = convertOutgoingMessageToMessage(msg);
      
      // Render message using renderer
      const rendered = renderer.render(message);
      
      // Send rendered message to Discord
      await channel.send(rendered);
    },
  };

  return adapter;
}

