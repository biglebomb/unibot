import type {
  TelegramConfig,
  TelegramAdapter,
  CoreEventHandler,
  OutgoingMessage,
} from "core/types"
import { mapTelegramUpdateToEvent } from "./mapping"
import { TelegramMessageRenderer } from "./renderer"
import { convertOutgoingMessageToMessage } from "core/message/converter"

const TELEGRAM_API_BASE = "https://api.telegram.org/bot"

export function createTelegramAdapter(config: TelegramConfig): TelegramAdapter {
  let coreHandler: CoreEventHandler | undefined
  const webhookPath = config.webhookPath || "/webhook/telegram"
  const renderer = new TelegramMessageRenderer()

  const adapter: TelegramAdapter = {
    name: "telegram",
    kind: "http-webhook",
    attachCore(handler: CoreEventHandler): void {
      coreHandler = handler
    },
    webhook: {
      path: webhookPath,
      handler: async (body: any, _headers: Record<string, string>) => {
        if (!coreHandler) {
          throw new Error("Core handler not attached to Telegram adapter")
        }

        const event = mapTelegramUpdateToEvent(body)
        if (event) {
          await coreHandler(event)
        }
      },
    },
    async send(
      msg: OutgoingMessage,
      meta: {
        channel: "telegram"
        externalUserId: string
        externalChatId?: string
      }
    ): Promise<void> {
      const chatId = meta.externalChatId || meta.externalUserId

      // Convert legacy OutgoingMessage to Message format
      const message = convertOutgoingMessageToMessage(msg)

      // Render message using renderer
      const rendered = renderer.render(message)

      // Determine which Telegram API endpoint to use
      if (rendered.photo) {
        // Image with optional caption
        await sendTelegramPhoto(
          config.botToken,
          chatId,
          rendered.photo,
          rendered.caption
        )
      } else {
        // Text message with optional buttons
        await sendTelegramMessage(
          config.botToken,
          chatId,
          rendered.text || "",
          rendered.reply_markup
        )
      }
    },
  }

  return adapter
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  replyMarkup?: {
    inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
  }
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`
  const body: {
    chat_id: string
    text: string
    reply_markup?: {
      inline_keyboard: Array<Array<{ text: string; callback_data: string }>>
    }
  } = {
    chat_id: chatId,
    text: text,
  }

  if (replyMarkup) {
    body.reply_markup = replyMarkup
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendPhoto`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }
}
