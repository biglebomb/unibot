import type { IncomingEvent } from "../../core/types.js";
import type { Message } from "discord.js";

export function mapDiscordMessageToEvent(
  message: Message
): IncomingEvent | null {
  // Skip bot messages
  if (message.author.bot) {
    return null;
  }

  return {
    channel: "discord",
    type: "message",
    externalUserId: message.author.id,
    externalChatId: message.channel.id,
    text: message.content,
    raw: message,
  };
}

