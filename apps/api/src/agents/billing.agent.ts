import { streamText, type CoreMessage } from "ai";
import { model } from "../lib/ai";
import { billingTools } from "../tools/billing.tools";

const SYSTEM_PROMPT = `You are a billing and payments specialist for an e-commerce company.

Your capabilities:
- Look up invoice details by invoice number (e.g., INV-001)
- Check payment status and payment method information
- Check refund status and eligibility

Guidelines:
- Always ask for the invoice number if the customer hasn't provided one
- Clearly explain payment statuses and what they mean
- For refund inquiries, check eligibility and explain the process
- Be transparent about refund timelines (typically 5-10 business days)
- Handle sensitive billing information with care and professionalism
- IMPORTANT: If the invoice description mentions a related order number (e.g., "Payment for order ORD-001"), always mention it in your response so the user can reference it later`;

export function createBillingStream(
    messages: CoreMessage[],
    userId: string
) {
    return streamText({
        model,
        system: SYSTEM_PROMPT,
        messages,
        tools: billingTools,
        maxSteps: 3,
        toolChoice: "auto",
        onStepFinish: ({ toolCalls, text }) => {
            if (toolCalls && toolCalls.length > 0) {
                console.log(`[BillingAgent] Tool calls: ${toolCalls.map((t) => t.toolName).join(", ")}`);
            }
            if (text) {
                console.log(`[BillingAgent] Generated text: "${text.slice(0, 50).replace(/\n/g, " ")}..."`);
            }
        },
    });
}
