import type { Content } from "../content/types.js";
import type { MessageComponent } from "../components/types.js";

export interface Message {
  content?: Content; // Optional (some channels allow components without content)
  components?: MessageComponent[]; // Array of components (buttons, selects, etc.)
}

