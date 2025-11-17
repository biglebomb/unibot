import type { IncomingEvent } from "core/types"
import type {
  Message,
  Interaction,
  ButtonInteraction,
  MessageReaction,
  GuildMember,
} from "discord.js"

export function mapDiscordMessageToEvent(
  message: Message
): IncomingEvent | null {
  // Skip bot messages
  if (message.author.bot) {
    return null
  }

  return {
    channel: "discord",
    type: "message",
    externalUserId: message.author.id,
    externalChatId: message.channel.id,
    text: message.content,
    raw: message,
  }
}

export function mapDiscordInteractionToEvent(
  interaction: Interaction
): IncomingEvent | null {
  // Only handle button interactions
  if (!interaction.isButton()) {
    return null
  }

  const buttonInteraction = interaction as ButtonInteraction

  return {
    channel: "discord",
    type: "button_click",
    externalUserId: buttonInteraction.user.id,
    externalChatId: buttonInteraction.channel?.id || undefined,
    text: buttonInteraction.customId,
    raw: interaction,
  }
}

export function mapDiscordReactionToEvent(
  reaction: MessageReaction,
  userId: string
): IncomingEvent | null {
  // Skip if message is from a bot
  if (reaction.message.author?.bot) {
    return null
  }

  const emoji = reaction.emoji.name || reaction.emoji.toString()

  return {
    channel: "discord",
    type: "reaction",
    externalUserId: userId,
    externalChatId: reaction.message.channel.id,
    messageId: reaction.message.id,
    reaction: emoji,
    raw: reaction,
  }
}

export function mapDiscordJoinToEvent(member: GuildMember): IncomingEvent {
  return {
    channel: "discord",
    type: "join",
    externalUserId: member.user.id,
    externalChatId: member.guild.id,
    joinedUserId: member.user.id,
    raw: member,
  }
}
