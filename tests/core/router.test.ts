import { describe, it, expect, vi } from "vitest"
import { Router } from "core/router"
import type { IncomingEvent, BotAdapter } from "core/types"

describe("Router", () => {
  it("should register handlers", () => {
    const router = new Router()
    const handler = vi.fn()

    router.on("message", handler)
    // Handler registration doesn't throw
    expect(handler).toBeDefined()
  })

  it("should call handler when handling matching event", async () => {
    const router = new Router()
    const handler = vi.fn().mockResolvedValue(undefined)

    router.on("message", handler)

    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      text: "Hello",
      raw: {},
    }

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    }

    await router.handle(event, adapter)

    expect(handler).toHaveBeenCalledOnce()
  })

  it("should support multiple handlers for same event type", async () => {
    const router = new Router()
    const handler1 = vi.fn().mockResolvedValue(undefined)
    const handler2 = vi.fn().mockResolvedValue(undefined)

    router.on("message", handler1)
    router.on("message", handler2)

    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      text: "Hello",
      raw: {},
    }

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    }

    await router.handle(event, adapter)

    expect(handler1).toHaveBeenCalledOnce()
    expect(handler2).toHaveBeenCalledOnce()
  })

  it("should handle reaction events", async () => {
    const router = new Router()
    const handler = vi.fn().mockResolvedValue(undefined)

    router.on("reaction", handler)

    const event: IncomingEvent = {
      channel: "telegram",
      type: "reaction",
      externalUserId: "user123",
      externalChatId: "chat456",
      messageId: "msg789",
      reaction: "👍",
      raw: {},
    }

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    }

    await router.handle(event, adapter)

    expect(handler).toHaveBeenCalledOnce()
  })

  it("should handle join events", async () => {
    const router = new Router()
    const handler = vi.fn().mockResolvedValue(undefined)

    router.on("join", handler)

    const event: IncomingEvent = {
      channel: "discord",
      type: "join",
      externalUserId: "user123",
      externalChatId: "guild456",
      joinedUserId: "user123",
      raw: {},
    }

    const adapter: BotAdapter = {
      name: "discord",
      attachCore: vi.fn(),
      send: vi.fn(),
    }

    await router.handle(event, adapter)

    expect(handler).toHaveBeenCalledOnce()
  })
})
