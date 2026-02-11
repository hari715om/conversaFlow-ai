import { Hono } from "hono";

const agentDefinitions = {
    support: {
        type: "support",
        name: "Support Agent",
        description: "Handles general support inquiries, FAQs, and troubleshooting",
        capabilities: [
            "Search FAQ database for common questions",
            "Query customer conversation history",
            "Provide general support and guidance",
        ],
        tools: ["searchFAQ", "queryConversationHistory"],
    },
    order: {
        type: "order",
        name: "Order Agent",
        description: "Handles order status, tracking, modifications, and cancellations",
        capabilities: [
            "Look up order details by order number",
            "Check delivery and shipping status",
            "List all orders for a customer",
        ],
        tools: ["getOrderDetails", "checkDeliveryStatus", "listUserOrders"],
    },
    billing: {
        type: "billing",
        name: "Billing Agent",
        description: "Handles payment issues, refunds, invoices, and subscription queries",
        capabilities: [
            "Look up invoice details",
            "Check payment status",
            "Check refund status and eligibility",
        ],
        tools: ["getInvoiceDetails", "checkPaymentStatus", "checkRefundStatus"],
    },
};

type AgentKey = keyof typeof agentDefinitions;

export const agentsRoutes = new Hono()
    .get("/", (c) => {
        const agents = Object.values(agentDefinitions).map(({ tools, ...rest }) => rest);
        return c.json({ success: true, data: agents });
    })
    .get("/:type/capabilities", (c) => {
        const type = c.req.param("type") as AgentKey;
        const agent = agentDefinitions[type];
        if (!agent) {
            return c.json({ success: false, error: `Agent type '${type}' not found` }, 404);
        }
        return c.json({ success: true, data: agent });
    });
