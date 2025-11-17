import { describe, it, expect } from "vitest"
import { TelegramMessageRenderer } from "../../../src/adapters/telegram/renderer"
import { DiscordMessageRenderer } from "../../../src/adapters/discord/renderer"
import type { Message } from "core/message/types"

describe("Message Renderers", () => {
  describe("TelegramMessageRenderer", () => {
    const renderer = new TelegramMessageRenderer()

    it("should render text content", () => {
      const result = renderer.renderContent({
        type: "text",
        text: "Hello world",
      })

      expect(result.text).toBe("Hello world")
      expect(result.photo).toBeUndefined()
    })

    it("should render image content with caption", () => {
      const result = renderer.renderContent({
        type: "image",
        url: "https://example.com/image.jpg",
        caption: "Image caption",
      })

      expect(result.photo).toBe("https://example.com/image.jpg")
      expect(result.caption).toBe("Image caption")
    })

    it("should render buttons as inline keyboard", () => {
      const result = renderer.renderComponents([
        { id: "btn1", label: "Button 1" },
        { id: "btn2", label: "Button 2" },
        { id: "btn3", label: "Button 3" },
      ])

      expect(result.reply_markup).toBeDefined()
      expect(result.reply_markup?.inline_keyboard).toBeDefined()
      expect(result.reply_markup?.inline_keyboard.length).toBeGreaterThan(0)
      expect(result.reply_markup?.inline_keyboard[0][0].callback_data).toBe(
        "btn1"
      )
      expect(result.reply_markup?.inline_keyboard[0][0].text).toBe("Button 1")
    })

    it("should render full message with content and components", () => {
      const message: Message = {
        content: {
          type: "text",
          text: "Choose an option",
        },
        components: [
          { id: "btn1", label: "Option 1" },
          { id: "btn2", label: "Option 2" },
        ],
      }

      const result = renderer.render(message)

      expect(result.text).toBe("Choose an option")
      expect(result.reply_markup).toBeDefined()
    })

    it("should throw error for text exceeding limit", () => {
      const longText = "a".repeat(5000)
      expect(() => {
        renderer.renderContent({
          type: "text",
          text: longText,
        })
      }).toThrow("exceeds Telegram limit")
    })

    it("should throw error for button ID exceeding limit", () => {
      const longId = "a".repeat(100)
      expect(() => {
        renderer.renderComponents([{ id: longId, label: "Button" }])
      }).toThrow("exceeds Telegram limit")
    })
  })

  describe("DiscordMessageRenderer", () => {
    const renderer = new DiscordMessageRenderer()

    it("should render text content", () => {
      const result = renderer.renderContent({
        type: "text",
        text: "Hello world",
      })

      expect(result.content).toBe("Hello world")
    })

    it("should render image content with caption", () => {
      const result = renderer.renderContent({
        type: "image",
        url: "https://example.com/image.jpg",
        caption: "Image caption",
      })

      expect(result.files).toBeDefined()
      expect(result.files?.[0]).toBe("https://example.com/image.jpg")
      expect(result.content).toBe("Image caption")
    })

    it("should render buttons as ActionRows", () => {
      const result = renderer.renderComponents([
        { id: "btn1", label: "Button 1" },
        { id: "btn2", label: "Button 2" },
      ])

      expect(result.components).toBeDefined()
      expect(result.components?.length).toBeGreaterThan(0)
    })

    it("should render full message with content and components", () => {
      const message: Message = {
        content: {
          type: "text",
          text: "Choose an option",
        },
        components: [
          { id: "btn1", label: "Option 1", style: "primary" },
          { id: "btn2", label: "Option 2", style: "success" },
        ],
      }

      const result = renderer.render(message)

      expect(result.content).toBe("Choose an option")
      expect(result.components).toBeDefined()
    })

    it("should throw error for text exceeding limit", () => {
      const longText = "a".repeat(3000)
      expect(() => {
        renderer.renderContent({
          type: "text",
          text: longText,
        })
      }).toThrow("exceeds Discord limit")
    })

    it("should throw error for button ID exceeding limit", () => {
      const longId = "a".repeat(150)
      expect(() => {
        renderer.renderComponents([{ id: longId, label: "Button" }])
      }).toThrow("exceeds Discord limit")
    })

    it("should support button styles", () => {
      const result = renderer.renderComponents([
        { id: "btn1", label: "Primary", style: "primary" },
        { id: "btn2", label: "Success", style: "success" },
        { id: "btn3", label: "Danger", style: "danger" },
      ])

      expect(result.components).toBeDefined()
    })
  })
})
