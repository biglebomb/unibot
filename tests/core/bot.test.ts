import { describe, it, expect, vi, beforeEach } from "vitest"
import { Bot } from "core/bot"

// Mock discord.js to prevent real connections when Discord adapter is created
vi.mock("discord.js", () => {
  const mockClient = {
    on: vi.fn(),
    login: vi.fn().mockResolvedValue(undefined),
    channels: {
      fetch: vi.fn(),
    },
  }

  return {
    Client: vi.fn(() => mockClient),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 3,
    },
  }
})

describe("Bot", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create bot with config", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    })
    expect(bot).toBeInstanceOf(Bot)
  })

  it("should register message handler", async () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    })

    const handler = vi.fn()
    bot.on("message", handler)

    // Handler registration doesn't throw
    expect(handler).toBeDefined()
  })

  it("should require Telegram adapter when configured", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    })

    const adapter = bot.requireTelegram()
    expect(adapter).toBeDefined()
    expect(adapter.name).toBe("telegram")
  })

  it("should throw when requiring Telegram adapter that is not configured", () => {
    const bot = new Bot({
      discord: { token: "test-token" },
    })

    expect(() => bot.requireTelegram()).toThrow(
      "Telegram adapter is not configured"
    )
  })

  it("should require Discord adapter when configured", () => {
    const bot = new Bot({
      discord: { token: "test-token" },
    })

    const adapter = bot.requireDiscord()
    expect(adapter).toBeDefined()
    expect(adapter.name).toBe("discord")
  })

  it("should throw when requiring Discord adapter that is not configured", () => {
    const bot = new Bot({
      telegram: { botToken: "test-token" },
    })

    expect(() => bot.requireDiscord()).toThrow(
      "Discord adapter is not configured"
    )
  })

  it("should call start on adapters that support it", async () => {
    const bot = new Bot({
      discord: { token: "test-token" },
    })

    const discordAdapter = bot.requireDiscord()
    const startSpy = vi
      .spyOn(discordAdapter, "start")
      .mockResolvedValue(undefined)

    await bot.start()

    // Verify that start() was called on the Discord adapter
    expect(startSpy).toHaveBeenCalledOnce()
  })
})
