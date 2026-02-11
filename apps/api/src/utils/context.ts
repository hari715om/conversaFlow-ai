import type { CoreMessage } from "ai";

const CHARS_PER_TOKEN = 4;
const DEFAULT_MAX_TOKENS = 2000;

export function compactMessages(
    messages: CoreMessage[],
    maxTokens: number = DEFAULT_MAX_TOKENS
): CoreMessage[] {
    if (messages.length === 0) return messages;

    const totalChars = messages.reduce((sum, m) => {
        const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        return sum + content.length;
    }, 0);

    const estimatedTokens = totalChars / CHARS_PER_TOKEN;

    if (estimatedTokens <= maxTokens) return messages;

    const systemMessages = messages.filter((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const systemChars = systemMessages.reduce((sum, m) => {
        const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        return sum + content.length;
    }, 0);

    const remainingBudget = (maxTokens * CHARS_PER_TOKEN) - systemChars;

    const kept: CoreMessage[] = [];
    let usedChars = 0;

    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
        const msg = nonSystemMessages[i];
        const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
        const msgChars = content.length;

        if (usedChars + msgChars > remainingBudget) break;
        kept.unshift(msg);
        usedChars += msgChars;
    }

    return [...systemMessages, ...kept];
}
