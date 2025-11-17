import type { ChannelName } from "core/types"

export interface ChannelContentCapabilities {
  maxTextLength?: number
  supportsImages: boolean
  maxImageSize?: number // in bytes
  supportsImageCaption: boolean
  maxCaptionLength?: number
  // Future: video, audio, file support
}

export const TELEGRAM_CONTENT_CAPABILITIES: ChannelContentCapabilities = {
  maxTextLength: 4096,
  supportsImages: true,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  supportsImageCaption: true,
  maxCaptionLength: 1024,
}

export const DISCORD_CONTENT_CAPABILITIES: ChannelContentCapabilities = {
  maxTextLength: 2000,
  supportsImages: true,
  maxImageSize: 25 * 1024 * 1024, // 25MB
  supportsImageCaption: true,
  maxCaptionLength: 4096,
}

export const CONTENT_CAPABILITIES: Record<
  ChannelName,
  ChannelContentCapabilities
> = {
  telegram: TELEGRAM_CONTENT_CAPABILITIES,
  discord: DISCORD_CONTENT_CAPABILITIES,
}
