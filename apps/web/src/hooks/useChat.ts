import { useState, useCallback } from "react";
import { api, type Message } from "../lib/api";

interface UseChatOptions {
    userId: string;
    conversationId?: string;
    onConversationCreated?: (id: string) => void;
}

interface UseChatReturn {
    messages: Message[];
    isStreaming: boolean;
    agentType: string | null;
    sendMessage: (content: string) => Promise<void>;
    loadMessages: (conversationId: string) => Promise<void>;
    clearMessages: () => void;
}

export function useChat({
    userId,
    conversationId,
    onConversationCreated,
}: UseChatOptions): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [agentType, setAgentType] = useState<string | null>(null);

    const loadMessages = useCallback(async (convId: string) => {
        const conversation = await api.getConversation(convId);
        if (conversation.messages) {
            setMessages(conversation.messages);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setAgentType(null);
    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            const userMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId: conversationId || "",
                role: "user",
                content,
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsStreaming(true);
            setAgentType(null);

            try {
                const response = await api.sendMessage(userId, content, conversationId);

                const convId = response.headers.get("X-Conversation-Id");
                const detectedAgent = response.headers.get("X-Agent-Type");

                if (convId && !conversationId) {
                    onConversationCreated?.(convId);
                }

                if (detectedAgent) {
                    setAgentType(detectedAgent);
                }

                const assistantMessage: Message = {
                    id: `temp-assistant-${Date.now()}`,
                    conversationId: convId || conversationId || "",
                    role: "assistant",
                    content: "",
                    agentType: detectedAgent,
                    createdAt: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, assistantMessage]);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error: ${response.status} ${response.statusText} - ${errorText}`);
                }

                if (!response.body) throw new Error("No response body received");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("0:")) {
                            try {
                                const text = JSON.parse(line.slice(2));
                                if (typeof text === "string") {
                                    fullText += text;
                                    setMessages((prev) => {
                                        const updated = [...prev];
                                        const last = updated[updated.length - 1];
                                        if (last && last.role === "assistant") {
                                            updated[updated.length - 1] = { ...last, content: fullText };
                                        }
                                        return updated;
                                    });
                                    // Add a small delay for smoother streaming visual
                                    await new Promise((resolve) => setTimeout(resolve, 20));
                                }
                            } catch { }
                        }
                    }
                }

                if (!fullText.trim()) {
                    throw new Error("Received empty response from assistant");
                }
            } catch (error) {
                console.error("Failed to send message:", error);
                const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    conversationId: conversationId || "",
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                    createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsStreaming(false);
            }
        },
        [userId, conversationId, onConversationCreated]
    );

    return { messages, isStreaming, agentType, sendMessage, loadMessages, clearMessages };
}
