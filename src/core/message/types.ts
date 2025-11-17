import type { Content } from "core/content/types"
import type { MessageComponent } from "core/components/types"

export interface Message {
  content?: Content // Optional (some channels allow components without content)
  components?: MessageComponent[] // Array of components (buttons, selects, etc.)
}
