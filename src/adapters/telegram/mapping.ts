import type { IncomingEvent } from "../../core/types.js";

export function mapTelegramUpdateToEvent(update: any): IncomingEvent | null {
  // Handle text messages
  if (update.message) {
    const msg = update.message;
    // Skip if message is from a bot
    if (msg.from?.is_bot) {
      return null;
    }

    return {
      channel: "telegram",
      type: "message",
      externalUserId: String(msg.from?.id || ""),
      externalChatId: String(msg.chat?.id || ""),
      text: msg.text,
      raw: update,
    };
  }

  // Handle button clicks (callback_query)
  if (update.callback_query) {
    const callback = update.callback_query;
    return {
      channel: "telegram",
      type: "button_click",
      externalUserId: String(callback.from?.id || ""),
      externalChatId: String(callback.message?.chat?.id || ""),
      text: callback.data,
      raw: update,
    };
  }

  // TODO: Handle other event types (reaction, join, etc.) in v1
  return null;
}

