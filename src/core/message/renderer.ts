import type { ChannelName } from "core/types"
import type { Content } from "core/content/types"
import type { MessageComponent } from "core/components/types"
import type { Message } from "./types"
import type { ChannelContentCapabilities } from "core/content/capabilities"
import type { ChannelButtonCapabilities } from "core/components/button"

export interface MessageRenderer<TChannel extends ChannelName> {
  channel: TChannel
  contentCapabilities: ChannelContentCapabilities
  componentCapabilities: {
    button: ChannelButtonCapabilities
    // Future: select, etc.
  }

  renderContent(content: Content): unknown // Channel-specific content format
  renderComponents(components: MessageComponent[]): unknown // Channel-specific component format
  render(message: Message): unknown // Full message in channel format
}
