import type { OutgoingMessage } from "core/types"
import type { Message } from "./types"
import type { TextContent, ImageContent } from "core/content/types"
import type { ButtonComponent } from "core/components/types"

/**
 * Converts legacy OutgoingMessage to new Message format
 * @deprecated This is for backward compatibility during migration
 */
export function convertOutgoingMessageToMessage(msg: OutgoingMessage): Message {
  if (msg.type === "text") {
    return {
      content: {
        type: "text",
        text: msg.text,
      } as TextContent,
    }
  }

  if (msg.type === "image") {
    return {
      content: {
        type: "image",
        url: msg.url,
        caption: msg.caption,
      } as ImageContent,
    }
  }

  if (msg.type === "buttons") {
    const buttons: ButtonComponent[] = msg.buttons.map((btn) => ({
      id: btn.id,
      label: btn.label,
    }))

    return {
      content: msg.text
        ? {
            type: "text",
            text: msg.text,
          }
        : undefined,
      components: buttons,
    }
  }

  throw new Error(`Unknown message type: ${(msg as any).type}`)
}
