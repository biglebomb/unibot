export type ChannelName = "telegram" | "discord";

export type IncomingEventType =
  | "message"
  | "button_click"
  | "reaction"
  | "join";

export interface IncomingEvent {
  channel: ChannelName;
  type: IncomingEventType;
  externalUserId: string;
  externalChatId?: string;
  text?: string;
  raw: unknown;
}

export type OutgoingMessage =
  | { type: "text"; text: string }
  | { type: "image"; url: string; caption?: string }
  | {
      type: "buttons";
      text: string;
      buttons: { id: string; label: string }[];
    };

export type CoreEventHandler = (event: IncomingEvent) => Promise<void>;

export interface BotAdapter {
  name: ChannelName;
  attachCore(handler: CoreEventHandler): void;
  start?(): Promise<void>;
  send(
    msg: OutgoingMessage,
    meta: {
      channel: ChannelName;
      externalUserId: string;
      externalChatId?: string;
    }
  ): Promise<void>;
}

export interface HttpWebhook {
  path: string;
  handler: (body: any, headers: Record<string, string>) => Promise<void>;
}

export interface TelegramAdapter extends BotAdapter {
  kind: "http-webhook";
  webhook: HttpWebhook;
}

export type TelegramConfig = {
  botToken: string;
  webhookPath?: string;
};

export type DiscordConfig = {
  token: string;
};

export type BotConfig = {
  telegram?: TelegramConfig;
  discord?: DiscordConfig;
};

