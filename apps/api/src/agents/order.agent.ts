import { streamText, type CoreMessage } from "ai";
import { model } from "../lib/ai";
import { orderTools } from "../tools/order.tools";

const SYSTEM_PROMPT = `You are an order management specialist for an e-commerce company.

Guidelines:
- Use 'listProducts' if the user asks what is available.
- If the user wants to buy something, confirm the item and price ONCE, then use 'createOrder'.
- Do NOT ask for an "Order Number" when creating a new order.
- If the user provides item and price (e.g., "Buy Smartwatch for $200"), assume price is correct and proceed to confirmation.
- Be concise. Don't repeat "I need to confirm" if the user just confirmed it.
- After creating an order, immediately confirm the Order Number to the user. Do NOT call 'getOrderDetails' or 'checkDeliveryStatus' for the order you just created unless the user asks.`;

export function createOrderStream(
    messages: CoreMessage[],
    userId: string
) {
    return streamText({
        model,
        system: `${SYSTEM_PROMPT}\nCurrent User ID: ${userId}`,
        messages,
        tools: orderTools,
        maxSteps: 3,
        toolChoice: "auto",
        onStepFinish: ({ toolCalls, text }) => {
            if (toolCalls && toolCalls.length > 0) {
                console.log(`[OrderAgent] Tool calls: ${toolCalls.map((t) => t.toolName).join(", ")}`);
            }
            if (text) {
                console.log(`[OrderAgent] Generated text: "${text.slice(0, 50).replace(/\n/g, " ")}..."`);
            }
        },
    });
}
