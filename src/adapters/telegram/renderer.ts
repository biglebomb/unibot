import type { MessageRenderer } from "../../core/message/renderer.js";
import type { Content } from "../../core/content/types.js";
import type { MessageComponent } from "../../core/components/types.js";
import type { Message } from "../../core/message/types.js";
import { TELEGRAM_CONTENT_CAPABILITIES } from "../../core/content/capabilities.js";
import { ButtonComponent, TELEGRAM_BUTTON_CAPABILITIES } from "../../core/components/button.js";

export class TelegramMessageRenderer
  implements MessageRenderer<"telegram">
{
  channel = "telegram" as const;
  contentCapabilities = TELEGRAM_CONTENT_CAPABILITIES;
  componentCapabilities = {
    button: TELEGRAM_BUTTON_CAPABILITIES,
  };

  renderContent(content: Content): {
    text?: string;
    photo?: string;
    caption?: string;
  } {
    if (content.type === "text") {
      // Validate text length
      if (
        this.contentCapabilities.maxTextLength &&
        content.text.length > this.contentCapabilities.maxTextLength
      ) {
        throw new Error(
          `Text exceeds Telegram limit of ${this.contentCapabilities.maxTextLength} characters`
        );
      }
      return { text: content.text };
    }

    if (content.type === "image") {
      // Validate caption length if present
      if (
        content.caption &&
        this.contentCapabilities.maxCaptionLength &&
        content.caption.length > this.contentCapabilities.maxCaptionLength
      ) {
        throw new Error(
          `Caption exceeds Telegram limit of ${this.contentCapabilities.maxCaptionLength} characters`
        );
      }
      return {
        photo: content.url,
        caption: content.caption,
      };
    }

    throw new Error(`Unsupported content type`);
  }

  renderComponents(components: MessageComponent[]): {
    reply_markup?: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };
  } {
    const buttons = components.filter(
      (c): c is ButtonComponent => true // For now, only buttons are supported
    );

    if (buttons.length === 0) {
      return {};
    }

    // Validate buttons
    for (const button of buttons) {
      const capabilities = this.componentCapabilities.button;

      // Validate button ID length (Telegram uses bytes, approximate with UTF-8)
      const idBytes = new TextEncoder().encode(button.id).length;
      if (idBytes > capabilities.maxButtonIdLength) {
        throw new Error(
          `Button ID "${button.id}" exceeds Telegram limit of ${capabilities.maxButtonIdLength} bytes`
        );
      }

      // Validate label length
      if (button.label.length > capabilities.maxLabelLength) {
        throw new Error(
          `Button label "${button.label}" exceeds Telegram limit of ${capabilities.maxLabelLength} characters`
        );
      }

      // Telegram doesn't support styles, warn if provided
      if (button.style && button.style !== "link") {
        // Styles are ignored in Telegram
      }

      // URL buttons are separate in Telegram, not handled here
      if (button.url) {
        throw new Error(
          "URL buttons in Telegram require separate implementation (use callback_data for interactive buttons)"
        );
      }
    }

    // Convert flat array to 2D array for inline keyboard
    // Telegram allows max 8 buttons per row, we'll use max 2 columns for better UX
    const maxButtonsPerRow = Math.min(
      this.componentCapabilities.button.maxButtonsPerRow,
      2
    ); // Use 2 for better UX
    const inlineKeyboard: Array<
      Array<{ text: string; callback_data: string }>
    > = [];

    for (let i = 0; i < buttons.length; i += maxButtonsPerRow) {
      const row = buttons.slice(i, i + maxButtonsPerRow).map((button) => ({
        text: button.label,
        callback_data: button.id,
      }));
      inlineKeyboard.push(row);
    }

    return {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };
  }

  render(message: Message): {
    text?: string;
    photo?: string;
    caption?: string;
    reply_markup?: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };
  } {
    const result: {
      text?: string;
      photo?: string;
      caption?: string;
      reply_markup?: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };
    } = {};

    if (message.content) {
      const contentResult = this.renderContent(message.content);
      Object.assign(result, contentResult);
    }

    if (message.components && message.components.length > 0) {
      const componentsResult = this.renderComponents(message.components);
      Object.assign(result, componentsResult);
    }

    return result;
  }
}

