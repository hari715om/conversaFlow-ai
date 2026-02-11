import { prisma } from "../lib/prisma";

export const supportService = {
    async searchFAQ(query: string) {
        const faqs = await prisma.faq.findMany();

        const queryLower = query.toLowerCase();
        const scored = faqs
            .map((faq) => {
                const questionLower = faq.question.toLowerCase();
                const answerLower = faq.answer.toLowerCase();
                const words = queryLower.split(/\s+/);
                const matchCount = words.filter(
                    (w) => questionLower.includes(w) || answerLower.includes(w)
                ).length;
                return { ...faq, score: matchCount };
            })
            .filter((f) => f.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        return scored.map(({ score, ...faq }) => faq);
    },

    async getRecentConversations(userId: string) {
        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 5,
            include: {
                _count: { select: { messages: true } },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { content: true, createdAt: true },
                },
            },
        });

        return conversations.map((c) => ({
            id: c.id,
            title: c.title,
            messageCount: c._count.messages,
            lastMessage: c.messages[0]?.content || null,
            updatedAt: c.updatedAt,
        }));
    },
};
