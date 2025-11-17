import { describe, it, expect } from "vitest"
import { convertOutgoingMessageToMessage } from "core/message/converter"
import type { OutgoingMessage } from "core/types"

describe("Message Converter", () => {
  it("should convert text message", () => {
    const outgoing: OutgoingMessage = {
      type: "text",
      text: "Hello world",
    }

    const message = convertOutgoingMessageToMessage(outgoing)

    expect(message.content?.type).toBe("text")
    if (message.content?.type === "text") {
      expect(message.content.text).toBe("Hello world")
    }
  })

  it("should convert image message", () => {
    const outgoing: OutgoingMessage = {
      type: "image",
      url: "https://example.com/image.jpg",
      caption: "Image caption",
    }

    const message = convertOutgoingMessageToMessage(outgoing)

    expect(message.content?.type).toBe("image")
    if (message.content?.type === "image") {
      expect(message.content.url).toBe("https://example.com/image.jpg")
      expect(message.content.caption).toBe("Image caption")
    }
  })

  it("should convert buttons message", () => {
    const outgoing: OutgoingMessage = {
      type: "buttons",
      text: "Choose an option",
      buttons: [
        { id: "btn1", label: "Option 1" },
        { id: "btn2", label: "Option 2" },
      ],
    }

    const message = convertOutgoingMessageToMessage(outgoing)

    expect(message.content?.type).toBe("text")
    if (message.content?.type === "text") {
      expect(message.content.text).toBe("Choose an option")
    }
    expect(message.components).toBeDefined()
    expect(message.components?.length).toBe(2)
    expect(message.components?.[0].id).toBe("btn1")
    expect(message.components?.[0].label).toBe("Option 1")
  })
})
