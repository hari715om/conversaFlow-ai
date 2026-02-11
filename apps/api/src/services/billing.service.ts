import { prisma } from "../lib/prisma";

export const billingService = {
    async getInvoice(invoiceNumber: string) {
        return prisma.payment.findUnique({
            where: { invoiceNumber },
            include: { user: { select: { name: true, email: true } } },
        });
    },

    async getPaymentStatus(invoiceNumber: string) {
        const payment = await prisma.payment.findUnique({
            where: { invoiceNumber },
            select: {
                invoiceNumber: true,
                amount: true,
                status: true,
                method: true,
                description: true,
                paidAt: true,
            },
        });

        return payment;
    },

    async getRefundStatus(invoiceNumber: string) {
        const payment = await prisma.payment.findUnique({
            where: { invoiceNumber },
            select: {
                invoiceNumber: true,
                amount: true,
                status: true,
                description: true,
                refundReason: true,
                paidAt: true,
            },
        });

        if (!payment) return null;

        return {
            ...payment,
            isRefunded: payment.status === "refunded",
            refundEligible: ["paid", "pending"].includes(payment.status),
        };
    },

    async getUserPayments(userId: string) {
        return prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },
};
