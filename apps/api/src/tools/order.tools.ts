import { tool } from "ai";
import { z } from "zod";
import { orderService } from "../services/order.service";

export const orderTools = {
    getOrderDetails: tool({
        description: "Fetch complete details for a specific order by its order number (e.g., ORD-001)",
        parameters: z.object({
            orderNumber: z.string().describe("The order number to look up, e.g., ORD-001"),
        }),
        execute: async ({ orderNumber }) => {
            console.log(`[OrderTool] Getting details for order: ${orderNumber}`);
            const order = await orderService.getOrderByNumber(orderNumber);
            if (!order) {
                console.log(`[OrderTool] Order ${orderNumber} not found`);
                return { found: false, message: `Order ${orderNumber} not found` };
            }
            console.log(`[OrderTool] Order found: ${order.id}`);
            return { found: true, order };
        },
    }),

    checkDeliveryStatus: tool({
        description: "Check the delivery and shipping status of an order, including tracking number and estimated delivery date",
        parameters: z.object({
            orderNumber: z.string().describe("The order number to check delivery status for"),
        }),
        execute: async ({ orderNumber }) => {
            console.log(`[OrderTool] Checking delivery for order: ${orderNumber}`);
            const status = await orderService.getDeliveryStatus(orderNumber);
            if (!status) {
                console.log(`[OrderTool] Delivery status not found for ${orderNumber}`);
                return { found: false, message: `Order ${orderNumber} not found` };
            }
            console.log(`[OrderTool] Delivery status found: ${status.status}`);
            return { found: true, delivery: status };
        },
    }),

    listUserOrders: tool({
        description: "List all orders for a specific user, showing order numbers, statuses, and amounts",
        parameters: z.object({
            userId: z.string().describe("The user ID to list orders for"),
        }),
        execute: async ({ userId }) => {
            console.log(`[OrderTool] Listing orders for user: ${userId}`);
            const orders = await orderService.getUserOrders(userId);
            console.log(`[OrderTool] Found ${orders.length} orders`);
            return { orders, count: orders.length };
        },
    }),

    createOrder: tool({
        description: "Create a new order for the user. Use this when the user explicitly wants to buy/book an item.",
        parameters: z.object({
            userId: z.string().describe("The user ID placing the order"),
            items: z.array(z.object({
                name: z.string(),
                quantity: z.number(),
                price: z.number()
            })).describe("List of items to purchase"),
            totalAmount: z.number().describe("Total amount of the order"),
        }),
        execute: async ({ userId, items, totalAmount }) => {
            console.log(`[OrderTool] Creating order for user: ${userId}, Amount: ${totalAmount}`);
            const order = await orderService.createOrder(userId, items, totalAmount);
            console.log(`[OrderTool] Order created: ${order.orderNumber}`);
            return { success: true, orderNumber: order.orderNumber, status: order.status };
        },
    }),

    listProducts: tool({
        description: "List available products and their prices.",
        parameters: z.object({}),
        execute: async () => {
            return {
                products: [
                    { name: "Smartwatch X1", price: 199.99, category: "Electronics" },
                    { name: "Wireless Headphones", price: 79.99, category: "Electronics" },
                    { name: "Phone Case", price: 15.99, category: "Accessories" },
                    { name: "Laptop Sleeve", price: 29.99, category: "Accessories" },
                    { name: "USB-C Hub", price: 49.99, category: "Electronics" },
                    { name: "Mechanical Keyboard", price: 129.99, category: "Electronics" },
                ]
            };
        },
    }),
};
