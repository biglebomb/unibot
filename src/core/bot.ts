import type {
  BotConfig,
  BotAdapter,
  TelegramAdapter,
  IncomingEvent,
  IncomingEventType,
} from "./types"
import { Router, type EventHandler } from "./router"
import { createTelegramAdapter } from "../adapters/telegram/telegramAdapter"
import { createDiscordAdapter } from "../adapters/discord/discordAdapter"

export class Bot {
  private telegram?: TelegramAdapter
  private discord?: BotAdapter
  private router = new Router()
  private coreHandler: (event: IncomingEvent) => Promise<void>

  constructor(config: BotConfig) {
    // Initialize Telegram adapter if configured
    if (config.telegram) {
      this.telegram = createTelegramAdapter(config.telegram)
    }

    // Initialize Discord adapter if configured
    if (config.discord) {
      this.discord = createDiscordAdapter(config.discord)
    }

    // Create core event handler that routes to router
    this.coreHandler = async (event: IncomingEvent) => {
      const adapter = this.getAdapterForChannel(event.channel)
      if (adapter) {
        await this.router.handle(event, adapter)
      }
    }

    // Attach core handler to all adapters
    this.telegram?.attachCore(this.coreHandler)
    this.discord?.attachCore(this.coreHandler)
  }

  on(eventType: IncomingEventType, handler: EventHandler): void {
    this.router.on(eventType, handler)
  }

  async start(): Promise<void> {
    // Start WebSocket-based adapters (Discord)
    if (this.discord?.start) {
      await this.discord.start()
    }
    // Telegram doesn't need start() - it's webhook-based
  }

  requireTelegram(): TelegramAdapter {
    if (!this.telegram) {
      throw new Error("Telegram adapter is not configured")
    }
    return this.telegram
  }

  requireDiscord(): BotAdapter {
    if (!this.discord) {
      throw new Error("Discord adapter is not configured")
    }
    return this.discord
  }

  private getAdapterForChannel(
    channel: IncomingEvent["channel"]
  ): BotAdapter | undefined {
    switch (channel) {
      case "telegram":
        return this.telegram
      case "discord":
        return this.discord
      default:
        return undefined
    }
  }
}
