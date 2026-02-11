import { tool } from "ai";
import { z } from "zod";
import { billingService } from "../services/billing.service";

export const billingTools = {
    getInvoiceDetails: tool({
        description: "Get full details for a specific invoice by its invoice number (e.g., INV-001)",
        parameters: z.object({
            invoiceNumber: z.string().describe("The invoice number to look up, e.g., INV-001"),
        }),
        execute: async ({ invoiceNumber }) => {
            console.log(`[BillingTool] Getting details for invoice: ${invoiceNumber}`);
            const invoice = await billingService.getInvoice(invoiceNumber);
            if (!invoice) {
                console.log(`[BillingTool] Invoice ${invoiceNumber} not found`);
                return { found: false, message: `Invoice ${invoiceNumber} not found` };
            }
            console.log(`[BillingTool] Invoice found: ${invoice.id}, Status: ${invoice.status}`);
            return { found: true, invoice };
        },
    }),

    checkPaymentStatus: tool({
        description: "Check the payment status for a specific invoice, including payment method and date",
        parameters: z.object({
            invoiceNumber: z.string().describe("The invoice number to check payment status for"),
        }),
        execute: async ({ invoiceNumber }) => {
            console.log(`[BillingTool] Check payment status for: ${invoiceNumber}`);
            const status = await billingService.getPaymentStatus(invoiceNumber);
            if (!status) {
                console.log(`[BillingTool] Payment status not found for ${invoiceNumber}`);
                return { found: false, message: `Invoice ${invoiceNumber} not found` };
            }
            console.log(`[BillingTool] Payment status found: ${status.status}`);
            return { found: true, payment: status };
        },
    }),

    checkRefundStatus: tool({
        description: "Check the refund status and eligibility for a specific invoice",
        parameters: z.object({
            invoiceNumber: z.string().describe("The invoice number to check refund status for"),
        }),
        execute: async ({ invoiceNumber }) => {
            console.log(`[BillingTool] Check refund status for: ${invoiceNumber}`);
            const refund = await billingService.getRefundStatus(invoiceNumber);
            if (!refund) {
                console.log(`[BillingTool] Refund status not found for ${invoiceNumber}`);
                return { found: false, message: `Invoice ${invoiceNumber} not found` };
            }
            console.log(`[BillingTool] Refund check complete: ${refund.refundEligible ? "Eligible" : "Not Eligible"}`);
            return { found: true, refund };
        },
    }),
};
