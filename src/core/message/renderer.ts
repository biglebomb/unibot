import type { ChannelName } from "../types.js";
import type { Content } from "../content/types.js";
import type { MessageComponent } from "../components/types.js";
import type { Message } from "./types.js";
import type { ChannelContentCapabilities } from "../content/capabilities.js";
import type { ChannelButtonCapabilities } from "../components/button.js";

export interface MessageRenderer<TChannel extends ChannelName> {
  channel: TChannel;
  contentCapabilities: ChannelContentCapabilities;
  componentCapabilities: {
    button: ChannelButtonCapabilities;
    // Future: select, etc.
  };

  renderContent(content: Content): unknown; // Channel-specific content format
  renderComponents(components: MessageComponent[]): unknown; // Channel-specific component format
  render(message: Message): unknown; // Full message in channel format
}

