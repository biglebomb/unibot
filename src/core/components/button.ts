import type { ChannelName } from "../types.js";

export interface ButtonComponent {
  id: string;
  label: string;
  style?: "primary" | "secondary" | "success" | "danger" | "link";
  url?: string; // For link buttons
}

export interface ChannelButtonCapabilities {
  maxButtonsPerRow: number;
  maxButtonIdLength: number;
  maxLabelLength: number;
  supportsStyles: boolean;
  supportsUrls: boolean;
}

export const TELEGRAM_BUTTON_CAPABILITIES: ChannelButtonCapabilities = {
  maxButtonsPerRow: 8,
  maxButtonIdLength: 64, // bytes
  maxLabelLength: 64,
  supportsStyles: false,
  supportsUrls: true, // But separate from callback buttons
};

export const DISCORD_BUTTON_CAPABILITIES: ChannelButtonCapabilities = {
  maxButtonsPerRow: 5,
  maxButtonIdLength: 100, // characters
  maxLabelLength: 80,
  supportsStyles: true,
  supportsUrls: true,
};

export const BUTTON_CAPABILITIES: Record<
  ChannelName,
  ChannelButtonCapabilities
> = {
  telegram: TELEGRAM_BUTTON_CAPABILITIES,
  discord: DISCORD_BUTTON_CAPABILITIES,
};

