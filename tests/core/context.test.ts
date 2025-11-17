import { describe, it, expect, vi } from "vitest"
import { Context } from "core/context"
import type { IncomingEvent, BotAdapter } from "core/types"
import type { Message } from "core/message/types"

describe("Context", () => {
  it("should create context with event and adapter", () => {
    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      externalChatId: "chat456",
      text: "Hello",
      raw: {},
    }

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    }

    const ctx = new Context(event, adapter)
    expect(ctx.channel).toBe("telegram")
    expect(ctx.userId).toBe("user123")
    expect(ctx.chatId).toBe("chat456")
    expect(ctx.text).toBe("Hello")
  })

  it("should call adapter.send when reply is called", async () => {
    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      externalChatId: "chat456",
      text: "Hello",
      raw: {},
    }

    const mockSend = vi.fn().mockResolvedValue(undefined)
    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: mockSend,
    }

    const ctx = new Context(event, adapter)
    const message: Message = {
      content: { type: "text", text: "Hi there!" },
    }

    await ctx.reply(message)

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(message, {
      channel: "telegram",
      externalUserId: "user123",
      externalChatId: "chat456",
    })
  })
})
