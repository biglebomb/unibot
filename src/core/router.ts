import type { IncomingEvent, IncomingEventType } from "./types.js";
import { Context } from "./context.js";
import type { BotAdapter } from "./types.js";

export type EventHandler = (ctx: Context) => Promise<void>;

export class Router {
  private handlers = new Map<IncomingEventType, EventHandler[]>();

  on(eventType: IncomingEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async handle(
    event: IncomingEvent,
    adapter: BotAdapter
  ): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    const ctx = new Context(event, adapter);

    // Execute all handlers for this event type
    await Promise.all(handlers.map((handler) => handler(ctx)));
  }
}

