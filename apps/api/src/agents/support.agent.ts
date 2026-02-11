import { streamText, type CoreMessage } from "ai";
import { model } from "../lib/ai";
import { supportTools } from "../tools/support.tools";

const SYSTEM_PROMPT = `You are a friendly and helpful customer support agent for an e-commerce company.

Guidelines:
- Use the available tools to find information before answering.
- Be concise but thorough.
- If you find relevant FAQ answers, use them but rephrase naturally.
- If you can't find an answer, be honest and suggest contacting support via email.
- Always maintain a professional and empathetic tone.`;

export function createSupportStream(
    messages: CoreMessage[],
    userId: string
) {
    return streamText({
        model,
        system: SYSTEM_PROMPT,
        messages,
        tools: supportTools,
        maxSteps: 3,

        onStepFinish: ({ toolCalls, text }) => {
            if (toolCalls && toolCalls.length > 0) {
                console.log(`[SupportAgent] Tool calls: ${toolCalls.map((t) => t.toolName).join(", ")}`);
            }
            if (text) {
                console.log(`[SupportAgent] Generated text: "${text.slice(0, 50).replace(/\n/g, " ")}..."`);
            }
        },
        onFinish: ({ text, toolCalls, finishReason }) => {
            console.log(`[SupportAgent] Stream finished. Reason: ${finishReason}`);
            console.log(`[SupportAgent] Final text: "${text}"`);
            console.log(`[SupportAgent] Tool calls in result: ${toolCalls?.length || 0}`);
        },
        onError: ({ error }) => {
            console.error(`[SupportAgent] Stream error:`, error);
        },
    });
}
