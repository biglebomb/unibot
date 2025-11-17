import type {
  TelegramConfig,
  TelegramAdapter,
  CoreEventHandler,
  OutgoingMessage,
} from "../../core/types.js";
import { mapTelegramUpdateToEvent } from "./mapping.js";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

export function createTelegramAdapter(
  config: TelegramConfig
): TelegramAdapter {
  let coreHandler: CoreEventHandler | undefined;
  const webhookPath = config.webhookPath || "/webhook/telegram";

  const adapter: TelegramAdapter = {
    name: "telegram",
    kind: "http-webhook",
    attachCore(handler: CoreEventHandler): void {
      coreHandler = handler;
    },
    webhook: {
      path: webhookPath,
      handler: async (body: any, headers: Record<string, string>) => {
        if (!coreHandler) {
          throw new Error("Core handler not attached to Telegram adapter");
        }

        const event = mapTelegramUpdateToEvent(body);
        if (event) {
          await coreHandler(event);
        }
      },
    },
    async send(
      msg: OutgoingMessage,
      meta: {
        channel: "telegram";
        externalUserId: string;
        externalChatId?: string;
      }
    ): Promise<void> {
      const chatId = meta.externalChatId || meta.externalUserId;

      if (msg.type === "text") {
        await sendTelegramMessage(config.botToken, chatId, msg.text);
      } else if (msg.type === "image") {
        await sendTelegramPhoto(
          config.botToken,
          chatId,
          msg.url,
          msg.caption
        );
      } else if (msg.type === "buttons") {
        // TODO: Implement inline keyboard buttons in v1
        // For now, send text and buttons as separate messages
        await sendTelegramMessage(config.botToken, chatId, msg.text);
        // Note: Inline keyboard implementation requires additional API call
      }
    },
  };

  return adapter;
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<void> {
  const url = `${TELEGRAM_API_BASE}${botToken}/sendPhoto`;
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
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }
}

