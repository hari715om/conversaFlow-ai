import { prisma } from "../lib/prisma";

export const orderService = {
    async getOrderByNumber(orderNumber: string) {
        return prisma.order.findUnique({
            where: { orderNumber },
            include: { user: { select: { name: true, email: true } } },
        });
    },

    async getDeliveryStatus(orderNumber: string) {
        const order = await prisma.order.findUnique({
            where: { orderNumber },
            select: {
                orderNumber: true,
                status: true,
                trackingNumber: true,
                shippedAt: true,
                deliveredAt: true,
            },
        });

        if (!order) return null;

        return {
            ...order,
            estimatedDelivery:
                order.status === "shipped" && order.shippedAt
                    ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
                    : null,
        };
    },

    async createOrder(userId: string, items: any[], totalAmount: number) {
        const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        return prisma.order.create({
            data: {
                orderNumber,
                userId,
                status: "processing",
                items,
                totalAmount,
                trackingNumber: null,
            },
        });
    },

    async getUserOrders(userId: string) {
        return prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                orderNumber: true,
                status: true,
                totalAmount: true,
                items: true,
                createdAt: true,
            },
        });
    },
};
