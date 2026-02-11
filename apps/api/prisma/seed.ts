import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.faq.deleteMany();
    await prisma.user.deleteMany();

    const alice = await prisma.user.create({
        data: {
            id: "user_alice",
            name: "Alice Johnson",
            email: "alice@example.com",
        },
    });

    const bob = await prisma.user.create({
        data: {
            id: "user_bob",
            name: "Bob Smith",
            email: "bob@example.com",
        },
    });

    const charlie = await prisma.user.create({
        data: {
            id: "user_charlie",
            name: "Charlie Brown",
            email: "charlie@example.com",
        },
    });

    await prisma.order.createMany({
        data: [
            {
                orderNumber: "ORD-001",
                userId: alice.id,
                status: "delivered",
                items: [
                    { name: "Wireless Headphones", quantity: 1, price: 79.99 },
                    { name: "Phone Case", quantity: 2, price: 15.99 },
                ],
                totalAmount: 111.97,
                trackingNumber: "TRK-98765",
                shippedAt: new Date("2026-01-20"),
                deliveredAt: new Date("2026-01-25"),
            },
            {
                orderNumber: "ORD-002",
                userId: alice.id,
                status: "shipped",
                items: [{ name: "USB-C Hub", quantity: 1, price: 49.99 }],
                totalAmount: 49.99,
                trackingNumber: "TRK-11223",
                shippedAt: new Date("2026-02-08"),
            },
            {
                orderNumber: "ORD-003",
                userId: bob.id,
                status: "processing",
                items: [
                    { name: "Mechanical Keyboard", quantity: 1, price: 129.99 },
                    { name: "Mouse Pad XL", quantity: 1, price: 24.99 },
                ],
                totalAmount: 154.98,
            },
            {
                orderNumber: "ORD-004",
                userId: bob.id,
                status: "cancelled",
                items: [{ name: "Webcam HD", quantity: 1, price: 69.99 }],
                totalAmount: 69.99,
            },
            {
                orderNumber: "ORD-005",
                userId: charlie.id,
                status: "pending",
                items: [
                    { name: "Monitor Stand", quantity: 1, price: 39.99 },
                    { name: "Cable Organizer", quantity: 3, price: 9.99 },
                ],
                totalAmount: 69.96,
            },
            {
                orderNumber: "ORD-006",
                userId: charlie.id,
                status: "delivered",
                items: [{ name: "Laptop Sleeve 15 inch", quantity: 1, price: 29.99 }],
                totalAmount: 29.99,
                trackingNumber: "TRK-44556",
                shippedAt: new Date("2026-01-10"),
                deliveredAt: new Date("2026-01-14"),
            },
            {
                orderNumber: "ORD-007",
                userId: alice.id,
                status: "shipped",
                items: [{ name: "Bluetooth Speaker", quantity: 1, price: 59.99 }],
                totalAmount: 59.99,
                trackingNumber: "TRK-77889",
                shippedAt: new Date("2026-02-09"),
            },
            {
                orderNumber: "ORD-008",
                userId: bob.id,
                status: "pending",
                items: [
                    { name: "Desk Lamp LED", quantity: 1, price: 44.99 },
                    { name: "Notebook A5", quantity: 2, price: 12.99 },
                ],
                totalAmount: 70.97,
            },
        ],
    });

    await prisma.payment.createMany({
        data: [
            {
                invoiceNumber: "INV-001",
                userId: alice.id,
                amount: 111.97,
                status: "paid",
                method: "credit_card",
                description: "Payment for order ORD-001",
                paidAt: new Date("2026-01-18"),
            },
            {
                invoiceNumber: "INV-002",
                userId: alice.id,
                amount: 49.99,
                status: "paid",
                method: "paypal",
                description: "Payment for order ORD-002",
                paidAt: new Date("2026-02-07"),
            },
            {
                invoiceNumber: "INV-003",
                userId: bob.id,
                amount: 154.98,
                status: "pending",
                method: "credit_card",
                description: "Payment for order ORD-003",
            },
            {
                invoiceNumber: "INV-004",
                userId: bob.id,
                amount: 69.99,
                status: "refunded",
                method: "credit_card",
                description: "Refund for cancelled order ORD-004",
                refundReason: "Customer requested cancellation before shipping",
                paidAt: new Date("2026-01-15"),
            },
            {
                invoiceNumber: "INV-005",
                userId: charlie.id,
                amount: 29.99,
                status: "paid",
                method: "bank_transfer",
                description: "Payment for order ORD-006",
                paidAt: new Date("2026-01-09"),
            },
            {
                invoiceNumber: "INV-006",
                userId: alice.id,
                amount: 59.99,
                status: "paid",
                method: "credit_card",
                description: "Payment for order ORD-007",
                paidAt: new Date("2026-02-08"),
            },
        ],
    });

    await prisma.faq.createMany({
        data: [
            {
                question: "How do I reset my password?",
                answer:
                    "Go to Settings > Account > Change Password. You will receive a verification email to confirm the change.",
                category: "account",
            },
            {
                question: "What is your return policy?",
                answer:
                    "We offer a 30-day return policy for unused items in original packaging. Contact support to initiate a return.",
                category: "returns",
            },
            {
                question: "How long does shipping take?",
                answer:
                    "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Free shipping on orders over $50.",
                category: "shipping",
            },
            {
                question: "How do I track my order?",
                answer:
                    "You can track your order using the tracking number provided in your shipping confirmation email, or ask me with your order number.",
                category: "shipping",
            },
            {
                question: "Can I cancel my order?",
                answer:
                    "Orders can be cancelled if they haven't been shipped yet. Once shipped, you'll need to initiate a return instead.",
                category: "general",
            },
            {
                question: "What payment methods do you accept?",
                answer:
                    "We accept credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers.",
                category: "general",
            },
            {
                question: "How do I request a refund?",
                answer:
                    "To request a refund, contact our billing support with your invoice number. Refunds are processed within 5-10 business days.",
                category: "returns",
            },
            {
                question: "Do you offer international shipping?",
                answer:
                    "Yes, we ship to over 50 countries. International shipping takes 10-15 business days. Additional customs fees may apply.",
                category: "shipping",
            },
            {
                question: "How do I update my account information?",
                answer:
                    "Go to Settings > Profile to update your name, email, or address. Changes take effect immediately.",
                category: "account",
            },
            {
                question: "What should I do if I received a damaged item?",
                answer:
                    "Contact our support team within 48 hours of delivery with photos of the damage. We will arrange a replacement or refund.",
                category: "returns",
            },
        ],
    });

    const conversation = await prisma.conversation.create({
        data: {
            title: "Order Status Inquiry",
            userId: alice.id,
        },
    });

    await prisma.message.createMany({
        data: [
            {
                conversationId: conversation.id,
                role: "user",
                content: "Hi, I want to check the status of my order ORD-001",
            },
            {
                conversationId: conversation.id,
                role: "assistant",
                content:
                    "Your order ORD-001 has been delivered on January 25, 2026. The tracking number is TRK-98765. It included Wireless Headphones and 2 Phone Cases for a total of $111.97.",
                agentType: "order",
            },
        ],
    });

    console.log("Database seeded successfully!");
    console.log(`  Users: 3 (Alice, Bob, Charlie)`);
    console.log(`  Orders: 8`);
    console.log(`  Payments: 6`);
    console.log(`  FAQs: 10`);
    console.log(`  Sample conversation: 1`);
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
