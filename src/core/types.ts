import type { Message } from "core/message/types"

export type ChannelName = "telegram" | "discord"

export type IncomingEventType = "message" | "button_click" | "reaction" | "join"

export interface IncomingEvent {
  channel: ChannelName
  type: IncomingEventType
  externalUserId: string
  externalChatId?: string
  text?: string
  messageId?: string // ID of the message being reacted to (for reaction events)
  reaction?: string // The reaction emoji/text (for reaction events)
  joinedUserId?: string // User who joined (for join events, may differ from externalUserId)
  raw: unknown
}

export type CoreEventHandler = (event: IncomingEvent) => Promise<void>

export interface BotAdapter {
  name: ChannelName
  attachCore(handler: CoreEventHandler): void
  start?(): Promise<void>
  send(
    msg: Message,
    meta: {
      channel: ChannelName
      externalUserId: string
      externalChatId?: string
    }
  ): Promise<void>
}

export interface HttpWebhook {
  path: string
  handler: (body: any, headers: Record<string, string>) => Promise<void>
}

export interface TelegramAdapter extends BotAdapter {
  kind: "http-webhook"
  webhook: HttpWebhook
}

export type TelegramConfig = {
  botToken: string
  webhookPath?: string
}

export type DiscordConfig = {
  token: string
}

export type BotConfig = {
  telegram?: TelegramConfig
  discord?: DiscordConfig
}
