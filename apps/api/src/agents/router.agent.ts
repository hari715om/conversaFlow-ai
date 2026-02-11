import { generateText, type CoreMessage } from "ai";
import { classifierModel } from "../lib/ai";

export type AgentType = "support" | "order" | "billing";

const SYSTEM_PROMPT = `You are a routing agent for a customer support system.
Your ONLY job is to classify the user's intent into one of these categories:
- "support" — general inquiries, FAQs, troubleshooting, how-to questions, account issues
- "order" — order status, tracking, modifications, cancellations, delivery questions
- "billing" — payment issues, refunds, invoices, subscription queries, charges

Respond with ONLY a single word: support, order, or billing.
Do not explain. Do not add punctuation. Just the category word.`;

export async function classifyIntent(
    messages: CoreMessage[]
): Promise<AgentType> {
    try {
        const result = await generateText({
            model: classifierModel,
            system: SYSTEM_PROMPT,
            messages,
            maxTokens: 10,
        });

        const classification = result.text.trim().toLowerCase();
        console.log(`[RouterAgent] Raw classification: "${result.text}" -> "${classification}"`);

        if (["support", "order", "billing"].includes(classification)) {
            return classification as AgentType;
        }

        return "support";
    } catch (error) {
        console.error("[Router] Classification failed, defaulting to support:", error);
        return "support";
    }
}
