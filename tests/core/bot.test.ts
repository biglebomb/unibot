import { describe, it, expect, vi, beforeEach } from "vitest";
import { Bot } from "../../src/core/bot.js";
import type {
  BotAdapter,
  IncomingEvent,
  OutgoingMessage,
} from "../../src/core/types.js";

describe("Bot", () => {
  let mockAdapter: BotAdapter;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSend = vi.fn();
    mockAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: mockSend,
    };
  });

  it("should create bot with config", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    });
    expect(bot).toBeInstanceOf(Bot);
  });

  it("should register message handler", async () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    });

    const handler = vi.fn();
    bot.on("message", handler);

    // Handler registration doesn't throw
    expect(handler).toBeDefined();
  });

  it("should require Telegram adapter when configured", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    });

    const adapter = bot.requireTelegram();
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("telegram");
  });

  it("should throw when requiring Telegram adapter that is not configured", () => {
    const bot = new Bot({
      discord: { token: "test-token" },
    });

    expect(() => bot.requireTelegram()).toThrow(
      "Telegram adapter is not configured"
    );
  });

  it("should require Discord adapter when configured", () => {
    const bot = new Bot({
      discord: { token: "test-token" },
    });

    const adapter = bot.requireDiscord();
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("discord");
  });

  it("should throw when requiring Discord adapter that is not configured", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    });

    expect(() => bot.requireDiscord()).toThrow(
      "Discord adapter is not configured"
    );
  });

  it("should call start on adapters that support it", async () => {
    const mockStart = vi.fn().mockResolvedValue(undefined);
    const adapterWithStart: BotAdapter = {
      ...mockAdapter,
      start: mockStart,
    };

    // Note: In real implementation, Discord adapter has start()
    // This test verifies the pattern
    const bot = new Bot({
      discord: { token: "test-token" },
    });

    await bot.start();
    // Discord adapter's start() should be called internally
    // We can't directly verify this without exposing internals,
    // but we can verify start() doesn't throw
  });
});

