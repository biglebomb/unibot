import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageCreateOptions,
} from "discord.js"
import type { MessageRenderer } from "core/message/renderer"
import type { Content } from "core/content/types"
import type { MessageComponent } from "core/components/types"
import type { Message } from "core/message/types"
import { DISCORD_CONTENT_CAPABILITIES } from "core/content/capabilities"
import {
  ButtonComponent,
  DISCORD_BUTTON_CAPABILITIES,
} from "core/components/button"

export class DiscordMessageRenderer implements MessageRenderer<"discord"> {
  channel = "discord" as const
  contentCapabilities = DISCORD_CONTENT_CAPABILITIES
  componentCapabilities = {
    button: DISCORD_BUTTON_CAPABILITIES,
  }

  renderContent(content: Content): {
    content?: string
    files?: string[]
    embeds?: Array<{ description?: string; image?: { url: string } }>
  } {
    if (content.type === "text") {
      // Validate text length
      if (
        this.contentCapabilities.maxTextLength &&
        content.text.length > this.contentCapabilities.maxTextLength
      ) {
        throw new Error(
          `Text exceeds Discord limit of ${this.contentCapabilities.maxTextLength} characters`
        )
      }
      return { content: content.text }
    }

    if (content.type === "image") {
      const result: {
        content?: string
        files?: string[]
        embeds?: Array<{ description?: string; image?: { url: string } }>
      } = {}

      // Discord can send images via files or embeds
      // For simplicity, we'll use files for now
      result.files = [content.url]

      // Add caption as content if present
      if (content.caption) {
        // Validate caption length
        if (
          this.contentCapabilities.maxCaptionLength &&
          content.caption.length > this.contentCapabilities.maxCaptionLength
        ) {
          throw new Error(
            `Caption exceeds Discord limit of ${this.contentCapabilities.maxCaptionLength} characters`
          )
        }
        result.content = content.caption
      }

      return result
    }

    throw new Error(`Unsupported content type`)
  }

  renderComponents(components: MessageComponent[]): {
    components?: ActionRowBuilder<ButtonBuilder>[]
  } {
    const buttons = components.filter(
      (_c): _c is ButtonComponent => true // For now, only buttons are supported
    )

    if (buttons.length === 0) {
      return {}
    }

    // Validate buttons
    for (const button of buttons) {
      const capabilities = this.componentCapabilities.button

      // Validate button ID length
      if (button.id.length > capabilities.maxButtonIdLength) {
        throw new Error(
          `Button ID "${button.id}" exceeds Discord limit of ${capabilities.maxButtonIdLength} characters`
        )
      }

      // Validate label length
      if (button.label.length > capabilities.maxLabelLength) {
        throw new Error(
          `Button label "${button.label}" exceeds Discord limit of ${capabilities.maxLabelLength} characters`
        )
      }

      // Validate URL button
      if (button.style === "link" && !button.url) {
        throw new Error("Link buttons require a URL")
      }

      if (button.url && button.style !== "link") {
        throw new Error("URL can only be used with link style buttons")
      }
    }

    // Discord allows max 5 buttons per ActionRow
    const maxButtonsPerRow = this.componentCapabilities.button.maxButtonsPerRow
    const actionRows: ActionRowBuilder<ButtonBuilder>[] = []

    for (let i = 0; i < buttons.length; i += maxButtonsPerRow) {
      const rowButtons = buttons.slice(i, i + maxButtonsPerRow)
      const actionRow = new ActionRowBuilder<ButtonBuilder>()

      for (const button of rowButtons) {
        const discordButton = new ButtonBuilder()
          .setLabel(button.label)
          .setStyle(this.mapButtonStyle(button.style || "primary"))

        if (button.style === "link" && button.url) {
          discordButton.setURL(button.url)
        } else {
          discordButton.setCustomId(button.id)
        }

        actionRow.addComponents(discordButton)
      }

      actionRows.push(actionRow)
    }

    return { components: actionRows }
  }

  render(message: Message): MessageCreateOptions {
    const result: MessageCreateOptions = {}

    if (message.content) {
      const contentResult = this.renderContent(message.content)
      if (contentResult.content) {
        result.content = contentResult.content
      }
      if (contentResult.files) {
        result.files = contentResult.files
      }
      if (contentResult.embeds) {
        result.embeds = contentResult.embeds
      }
    }

    if (message.components && message.components.length > 0) {
      const componentsResult = this.renderComponents(message.components)
      if (componentsResult.components) {
        // ActionRowBuilder implements JSONEncodable which is compatible with MessageCreateOptions
        result.components = componentsResult.components as any
      }
    }

    return result
  }

  private mapButtonStyle(
    style: "primary" | "secondary" | "success" | "danger" | "link"
  ): ButtonStyle {
    switch (style) {
      case "primary":
        return ButtonStyle.Primary
      case "secondary":
        return ButtonStyle.Secondary
      case "success":
        return ButtonStyle.Success
      case "danger":
        return ButtonStyle.Danger
      case "link":
        return ButtonStyle.Link
      default:
        return ButtonStyle.Primary
    }
  }
}
