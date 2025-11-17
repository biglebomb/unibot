// Base content interface
export interface MessageContent {
  type: "text" | "image" | "video" | "audio" | "file"
}

// Text content
export interface TextContent extends MessageContent {
  type: "text"
  text: string
}

// Image content
export interface ImageContent extends MessageContent {
  type: "image"
  url: string
  caption?: string
}

// Union type for all content types
export type Content = TextContent | ImageContent
