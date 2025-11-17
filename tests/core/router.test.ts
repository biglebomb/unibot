import { describe, it, expect, vi } from "vitest";
import { Router } from "../../src/core/router.js";
import type { IncomingEvent, BotAdapter } from "../../src/core/types.js";

describe("Router", () => {
  it("should register handlers", () => {
    const router = new Router();
    const handler = vi.fn();

    router.on("message", handler);
    // Handler registration doesn't throw
    expect(handler).toBeDefined();
  });

  it("should call handler when handling matching event", async () => {
    const router = new Router();
    const handler = vi.fn().mockResolvedValue(undefined);

    router.on("message", handler);

    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      text: "Hello",
      raw: {},
    };

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    };

    await router.handle(event, adapter);

    expect(handler).toHaveBeenCalledOnce();
  });

  it("should support multiple handlers for same event type", async () => {
    const router = new Router();
    const handler1 = vi.fn().mockResolvedValue(undefined);
    const handler2 = vi.fn().mockResolvedValue(undefined);

    router.on("message", handler1);
    router.on("message", handler2);

    const event: IncomingEvent = {
      channel: "telegram",
      type: "message",
      externalUserId: "user123",
      text: "Hello",
      raw: {},
    };

    const adapter: BotAdapter = {
      name: "telegram",
      attachCore: vi.fn(),
      send: vi.fn(),
    };

    await router.handle(event, adapter);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });
});

