import type { Context } from "hono";
import { routerService } from "../services/router.service";

export const chatController = {
    async sendMessage(c: Context) {
        const body = await c.req.json();
        const { userId, message, conversationId } = body;
        console.log(`[ChatController] Received message from ${userId}: "${message.slice(0, 50)}${message.length > 50 ? "..." : ""}" (ConvID: ${conversationId || "new"})`);


        if (!userId || !message) {
            return c.json({ success: false, error: "userId and message are required" }, 400);
        }

        const { stream, conversationId: convId, agentType } = await routerService.handleMessage(
            userId,
            message,
            conversationId
        );

        const response = stream.toDataStreamResponse({
            headers: {
                "X-Conversation-Id": convId,
                "X-Agent-Type": agentType,
            },
        });

        const reader = stream.textStream;
        let fullText = "";

        const originalBody = response.body;
        if (!originalBody) return response;

        const transform = new TransformStream({
            async flush() {
                if (fullText.trim()) {
                    await routerService.saveAssistantMessage(convId, fullText, agentType);
                }
            },
        });

        const [streamForClient, streamForCapture] = originalBody.tee();

        const captureReader = streamForCapture.getReader();
        (async () => {
            const decoder = new TextDecoder();
            try {
                while (true) {
                    const { done, value } = await captureReader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("0:")) {
                            try {
                                const text = JSON.parse(line.slice(2));
                                if (typeof text === "string") fullText += text;
                            } catch { }
                        }
                    }
                }
            } catch { }
            if (fullText.trim()) {
                await routerService.saveAssistantMessage(convId, fullText, agentType);
            }
        })();

        return new Response(streamForClient, {
            headers: {
                ...Object.fromEntries(response.headers.entries()),
            },
        });
    },

    async getConversations(c: Context) {
        const userId = c.req.query("userId");
        if (!userId) {
            return c.json({ success: false, error: "userId query param is required" }, 400);
        }
        const conversations = await routerService.getConversations(userId);
        return c.json({ success: true, data: conversations });
    },

    async getConversation(c: Context) {
        const id = c.req.param("id");
        const conversation = await routerService.getConversation(id);
        return c.json({ success: true, data: conversation });
    },

    async deleteConversation(c: Context) {
        const id = c.req.param("id");
        await routerService.deleteConversation(id);
        return c.json({ success: true, message: "Conversation deleted" });
    },
};
