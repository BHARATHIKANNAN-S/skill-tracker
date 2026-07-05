export { askAiAssistant, generateAiText, generateStructuredAi, isAiConfigured } from "./provider";
export type { AiMessage } from "./provider";

// Backward-compatible alias used by older routes
export { askAiAssistant as generateResponse } from "./provider";
