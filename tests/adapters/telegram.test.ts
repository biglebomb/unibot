import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTelegramAdapter } from "../../src/adapters/telegram/telegramAdapter.js";
import { mapTelegramUpdateToEvent } from "../../src/adapters/telegram/mapping.js";
import type { CoreEventHandler } from "../../src/core/types.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("Telegram Adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTelegramAdapter", () => {
    it("should create adapter with default webhook path", () => {
      const adapter = createTelegramAdapter({
        botToken: "test-token",
      });

      expect(adapter.name).toBe("telegram");
      expect(adapter.kind).toBe("http-webhook");
      expect(adapter.webhook.path).toBe("/webhook/telegram");
    });

    it("should create adapter with custom webhook path", () => {
      const adapter = createTelegramAdapter({
        botToken: "test-token",
        webhookPath: "/custom/path",
      });

      expect(adapter.webhook.path).toBe("/custom/path");
    });

    it("should attach core handler", () => {
      const adapter = createTelegramAdapter({
        botToken: "test-token",
      });

      const handler: CoreEventHandler = vi.fn();
      adapter.attachCore(handler);

      // Handler attachment doesn't throw
      expect(handler).toBeDefined();
    });

    it("should call core handler when webhook receives valid update", async () => {
      const adapter = createTelegramAdapter({
        botToken: "test-token",
      });

      const handler: CoreEventHandler = vi.fn().mockResolvedValue(undefined);
      adapter.attachCore(handler);

      const update = {
        message: {
          from: { id: 123, is_bot: false },
          chat: { id: 456 },
          text: "Hello",
        },
      };

      await adapter.webhook.handler(update, {});

      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe("mapTelegramUpdateToEvent", () => {
    it("should map text message to IncomingEvent", () => {
      const update = {
        message: {
          from: { id: 123, is_bot: false },
          chat: { id: 456 },
          text: "Hello world",
        },
      };

      const event = mapTelegramUpdateToEvent(update);

      expect(event).not.toBeNull();
      expect(event?.channel).toBe("telegram");
      expect(event?.type).toBe("message");
      expect(event?.externalUserId).toBe("123");
      expect(event?.externalChatId).toBe("456");
      expect(event?.text).toBe("Hello world");
    });

    it("should return null for bot messages", () => {
      const update = {
        message: {
          from: { id: 123, is_bot: true },
          chat: { id: 456 },
          text: "Hello",
        },
      };

      const event = mapTelegramUpdateToEvent(update);
      expect(event).toBeNull();
    });

    it("should map callback_query to button_click event", () => {
      const update = {
        callback_query: {
          from: { id: 123 },
          message: { chat: { id: 456 } },
          data: "button_clicked",
        },
      };

      const event = mapTelegramUpdateToEvent(update);

      expect(event).not.toBeNull();
      expect(event?.type).toBe("button_click");
      expect(event?.text).toBe("button_clicked");
    });

    it("should return null for unsupported update types", () => {
      const update = {
        edited_message: {
          from: { id: 123 },
          chat: { id: 456 },
        },
      };

      const event = mapTelegramUpdateToEvent(update);
      expect(event).toBeNull();
    });
  });

  describe("send", () => {
    it("should send text message via Telegram API", async () => {
      const adapter = createTelegramAdapter({
        botToken: "test-token",
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue("{}"),
      });

      await adapter.send(
        { type: "text", text: "Hello" },
        {
          channel: "telegram",
          externalUserId: "123",
          externalChatId: "456",
        }
      );

      expect(global.fetch).toHaveBeenCalledOnce();
      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toContain("sendMessage");
    });
  });
});

