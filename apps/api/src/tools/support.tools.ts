import { tool } from "ai";
import { z } from "zod";
import { supportService } from "../services/support.service";

export const supportTools = {
    searchFAQ: tool({
        description: "Search the FAQ database for answers to common customer questions about shipping, returns, accounts, and general policies",
        parameters: z.object({
            query: z.string().describe("The customer's question or search terms"),
        }),
        execute: async ({ query }) => {
            console.log(`[SupportTool] Searching FAQ for: "${query}"`);
            const results = await supportService.searchFAQ(query);
            console.log(`[SupportTool] Found ${results.length} FAQs`);
            if (results.length === 0) {
                return { found: false, message: "No matching FAQs found" };
            }
            return { found: true, faqs: results };
        },
    }),

    queryConversationHistory: tool({
        description: "Look up a customer's recent conversation history to provide context-aware support",
        parameters: z.object({
            userId: z.string().describe("The user ID to look up conversations for"),
        }),
        execute: async ({ userId }) => {
            console.log(`[SupportTool] Querying history for user: ${userId}`);
            const conversations = await supportService.getRecentConversations(userId);
            console.log(`[SupportTool] Found ${conversations.length} recent conversations`);
            return { conversations };
        },
    }),
};
