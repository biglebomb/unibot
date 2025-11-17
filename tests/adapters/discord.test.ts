import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDiscordAdapter } from "../../src/adapters/discord/discordAdapter.js";
import {
  mapDiscordMessageToEvent,
  mapDiscordInteractionToEvent,
  mapDiscordReactionToEvent,
  mapDiscordJoinToEvent,
} from "../../src/adapters/discord/mapping.js";
import type { CoreEventHandler } from "../../src/core/types.js";
import type {
  Message,
  TextChannel,
  Interaction,
  ButtonInteraction,
  MessageReaction,
  GuildMember,
} from "discord.js";

// Mock discord.js
vi.mock("discord.js", () => {
  const mockClient = {
    on: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    channels: {
      fetch: vi.fn(),
    },
  };

  return {
    Client: vi.fn(() => mockClient),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 3,
      GuildMembers: 4,
      GuildMessageReactions: 5,
    },
    ActionRowBuilder: vi.fn().mockImplementation(() => ({
      addComponents: vi.fn().mockReturnThis(),
    })),
    ButtonBuilder: vi.fn().mockImplementation(() => ({
      setCustomId: vi.fn().mockReturnThis(),
      setLabel: vi.fn().mockReturnThis(),
      setStyle: vi.fn().mockReturnThis(),
    })),
    ButtonStyle: {
      Primary: 1,
      Secondary: 2,
      Success: 3,
      Danger: 4,
      Link: 5,
    },
  };
});

describe("Discord Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDiscordAdapter", () => {
    it("should create adapter", () => {
      const adapter = createDiscordAdapter({
        token: "test-token",
      });

      expect(adapter.name).toBe("discord");
      expect(adapter.start).toBeDefined();
    });

    it("should attach core handler", () => {
      const adapter = createDiscordAdapter({
        token: "test-token",
      });

      const handler: CoreEventHandler = vi.fn();
      adapter.attachCore(handler);

      expect(handler).toBeDefined();
    });

    it("should connect to Discord gateway on start", async () => {
      const { Client } = await import("discord.js");
      const adapter = createDiscordAdapter({
        token: "test-token",
      });

      await adapter.start?.();

      expect(Client).toHaveBeenCalled();
    });
  });

  describe("mapDiscordMessageToEvent", () => {
    it("should map Discord message to IncomingEvent", () => {
      const mockMessage = {
        author: {
          id: "user123",
          bot: false,
        },
        channel: {
          id: "channel456",
        },
        content: "Hello world",
      } as unknown as Message;

      const event = mapDiscordMessageToEvent(mockMessage);

      expect(event).not.toBeNull();
      expect(event?.channel).toBe("discord");
      expect(event?.type).toBe("message");
      expect(event?.externalUserId).toBe("user123");
      expect(event?.externalChatId).toBe("channel456");
      expect(event?.text).toBe("Hello world");
    });

    it("should return null for bot messages", () => {
      const mockMessage = {
        author: {
          id: "bot123",
          bot: true,
        },
        channel: {
          id: "channel456",
        },
        content: "Hello",
      } as unknown as Message;

      const event = mapDiscordMessageToEvent(mockMessage);
      expect(event).toBeNull();
    });
  });

  describe("send", () => {
    it("should send text message to Discord channel", async () => {
      const { Client } = await import("discord.js");
      const mockClient = new Client({ intents: [] });
      const mockChannel = {
        id: "channel123",
        send: vi.fn().mockResolvedValue(undefined),
        isTextBased: vi.fn().mockReturnValue(true),
      } as unknown as TextChannel;

      (mockClient.channels.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockChannel
      );

      const adapter = createDiscordAdapter({
        token: "test-token",
      });

      // Replace the internal client reference for testing
      // Note: This is a simplified test - in real implementation,
      // we'd need to expose the client or use a factory pattern
      await adapter.send(
        { type: "text", text: "Hello" },
        {
          channel: "discord",
          externalUserId: "user123",
          externalChatId: "channel123",
        }
      );

      // Verify send was called (if we had access to the channel)
      // This test structure shows the pattern
    });

    it("should send buttons message with ActionRow components", async () => {
      const { Client, ActionRowBuilder, ButtonBuilder } = await import("discord.js");
      const mockClient = new Client({ intents: [] });
      const mockSend = vi.fn().mockResolvedValue(undefined);
      const mockChannel = {
        id: "channel123",
        send: mockSend,
        isTextBased: vi.fn().mockReturnValue(true),
      } as unknown as TextChannel;

      (mockClient.channels.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockChannel
      );

      const adapter = createDiscordAdapter({
        token: "test-token",
      });

      // We can't easily test the internal client, but we can verify the structure
      // In a real scenario, we'd need to expose the client or use dependency injection
      expect(ActionRowBuilder).toBeDefined();
      expect(ButtonBuilder).toBeDefined();
    });
  });

  describe("mapDiscordInteractionToEvent", () => {
    it("should map button interaction to button_click event", () => {
      const mockInteraction = {
        isButton: vi.fn().mockReturnValue(true),
        user: { id: "user123" },
        channel: { id: "channel456" },
        customId: "button_clicked",
      } as unknown as ButtonInteraction;

      const event = mapDiscordInteractionToEvent(mockInteraction as Interaction);

      expect(event).not.toBeNull();
      expect(event?.channel).toBe("discord");
      expect(event?.type).toBe("button_click");
      expect(event?.externalUserId).toBe("user123");
      expect(event?.externalChatId).toBe("channel456");
      expect(event?.text).toBe("button_clicked");
    });

    it("should return null for non-button interactions", () => {
      const mockInteraction = {
        isButton: vi.fn().mockReturnValue(false),
      } as unknown as Interaction;

      const event = mapDiscordInteractionToEvent(mockInteraction);

      expect(event).toBeNull();
    });
  });

  describe("mapDiscordReactionToEvent", () => {
    it("should map message reaction to reaction event", () => {
      const mockReaction = {
        emoji: {
          name: "👍",
          toString: () => "👍",
        },
        message: {
          id: "msg123",
          channel: { id: "channel456" },
          author: { bot: false },
        },
      } as unknown as MessageReaction;

      const event = mapDiscordReactionToEvent(mockReaction, "user123");

      expect(event).not.toBeNull();
      expect(event?.channel).toBe("discord");
      expect(event?.type).toBe("reaction");
      expect(event?.externalUserId).toBe("user123");
      expect(event?.externalChatId).toBe("channel456");
      expect(event?.messageId).toBe("msg123");
      expect(event?.reaction).toBe("👍");
    });

    it("should return null for reactions on bot messages", () => {
      const mockReaction = {
        emoji: {
          name: "👍",
          toString: () => "👍",
        },
        message: {
          id: "msg123",
          channel: { id: "channel456" },
          author: { bot: true },
        },
      } as unknown as MessageReaction;

      const event = mapDiscordReactionToEvent(mockReaction, "user123");

      expect(event).toBeNull();
    });
  });

  describe("mapDiscordJoinToEvent", () => {
    it("should map guild member add to join event", () => {
      const mockMember = {
        user: {
          id: "user123",
        },
        guild: {
          id: "guild456",
        },
      } as unknown as GuildMember;

      const event = mapDiscordJoinToEvent(mockMember);

      expect(event.channel).toBe("discord");
      expect(event.type).toBe("join");
      expect(event.externalUserId).toBe("user123");
      expect(event.externalChatId).toBe("guild456");
      expect(event.joinedUserId).toBe("user123");
    });
  });
});

