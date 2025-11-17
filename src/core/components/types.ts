import type { ButtonComponent } from "./button"

// Re-export ButtonComponent for convenience
export type { ButtonComponent }

// Union type for all component types
// Future: SelectComponent, etc.
export type MessageComponent = ButtonComponent
