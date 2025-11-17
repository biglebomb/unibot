import type { IncomingEvent, OutgoingMessage, BotAdapter } from "./types"

export class Context {
  constructor(
    private readonly event: IncomingEvent,
    private readonly adapter: BotAdapter
  ) {}

  get channel(): IncomingEvent["channel"] {
    return this.event.channel
  }

  get userId(): string {
    return this.event.externalUserId
  }

  get chatId(): string | undefined {
    return this.event.externalChatId
  }

  get text(): string | undefined {
    return this.event.text
  }

  get raw(): unknown {
    return this.event.raw
  }

  async reply(msg: OutgoingMessage): Promise<void> {
    await this.adapter.send(msg, {
      channel: this.event.channel,
      externalUserId: this.event.externalUserId,
      externalChatId: this.event.externalChatId,
    })
  }
}
