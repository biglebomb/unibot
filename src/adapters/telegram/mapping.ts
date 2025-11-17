import type { IncomingEvent } from "core/types"

export function mapTelegramUpdateToEvent(update: any): IncomingEvent | null {
  // Handle new chat members (join events) - check before regular messages
  if (update.message?.new_chat_members) {
    const newMembers = update.message.new_chat_members
    // Handle each new member
    if (newMembers.length > 0) {
      const member = newMembers[0]
      return {
        channel: "telegram",
        type: "join",
        externalUserId: String(update.message.from?.id || ""),
        externalChatId: String(update.message.chat?.id || ""),
        joinedUserId: String(member.id || ""),
        raw: update,
      }
    }
  }

  // Handle text messages
  if (update.message) {
    const msg = update.message
    // Skip if message is from a bot
    if (msg.from?.is_bot) {
      return null
    }

    return {
      channel: "telegram",
      type: "message",
      externalUserId: String(msg.from?.id || ""),
      externalChatId: String(msg.chat?.id || ""),
      text: msg.text,
      raw: update,
    }
  }

  // Handle button clicks (callback_query)
  if (update.callback_query) {
    const callback = update.callback_query
    return {
      channel: "telegram",
      type: "button_click",
      externalUserId: String(callback.from?.id || ""),
      externalChatId: String(callback.message?.chat?.id || ""),
      text: callback.data,
      raw: update,
    }
  }

  // Handle message reactions
  if (update.message_reaction) {
    const reaction = update.message_reaction
    const emoji = reaction.new_reaction?.[0]?.emoji
    return {
      channel: "telegram",
      type: "reaction",
      externalUserId: String(reaction.user?.id || ""),
      externalChatId: String(reaction.chat?.id || ""),
      messageId: String(reaction.message_id || ""),
      reaction: emoji?.name || emoji?.emoji || undefined,
      raw: update,
    }
  }

  return null
}
