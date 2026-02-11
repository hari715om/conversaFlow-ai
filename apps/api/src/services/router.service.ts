import type { CoreMessage } from "ai";
import { prisma } from "../lib/prisma";
import { classifyIntent, type AgentType } from "../agents/router.agent";
import { createSupportStream } from "../agents/support.agent";
import { createOrderStream } from "../agents/order.agent";
import { createBillingStream } from "../agents/billing.agent";
import { compactMessages } from "../utils/context";
import { AppError } from "../middleware/error.middleware";

export const routerService = {
    async handleMessage(userId: string, message: string, conversationId?: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError(404, "User not found");

        let conversation;
        if (conversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });
            if (!conversation) throw new AppError(404, "Conversation not found");
        } else {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: message.slice(0, 50),
                },
            });
        }

        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: "user",
                content: message,
            },
        });

        const dbMessages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "asc" },
            take: -20, // Limit to last 20 messages to prevent context overflow
        });

        const validRoles = ["user", "assistant", "system"] as const;
        const coreMessages: CoreMessage[] = dbMessages
            .filter((m) => validRoles.includes(m.role as any))
            .map((m) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
            }));

        const compactedMessages = compactMessages(coreMessages);

        const agentType = await classifyIntent(compactedMessages);
        console.log(`[RouterService] Intent classified as: "${agentType}". Delegating to ${agentType} agent.`);

        const streamResult = this.delegateToAgent(agentType, compactedMessages, userId);

        return {
            stream: streamResult,
            conversationId: conversation.id,
            agentType,
        };
    },

    delegateToAgent(agentType: AgentType, messages: CoreMessage[], userId: string) {
        switch (agentType) {
            case "order":
                return createOrderStream(messages, userId);
            case "billing":
                return createBillingStream(messages, userId);
            case "support":
            default:
                return createSupportStream(messages, userId);
        }
    },

    async saveAssistantMessage(
        conversationId: string,
        content: string,
        agentType: string
    ) {
        await prisma.message.create({
            data: {
                conversationId,
                role: "assistant",
                content,
                agentType,
            },
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
    },

    async getConversations(userId: string) {
        return prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { content: true, role: true, agentType: true },
                },
                _count: { select: { messages: true } },
            },
        });
    },

    async getConversation(conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });

        if (!conversation) throw new AppError(404, "Conversation not found");
        return conversation;
    },

    async deleteConversation(conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });
        if (!conversation) throw new AppError(404, "Conversation not found");

        await prisma.conversation.delete({ where: { id: conversationId } });
        return { success: true };
    },
};
