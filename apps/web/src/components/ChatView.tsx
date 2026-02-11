import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatViewProps {
    userId: string;
    conversationId: string | null;
    onConversationCreated: (id: string) => void;
}

export function ChatView({
    userId,
    conversationId,
    onConversationCreated,
}: ChatViewProps) {
    const {
        messages,
        isStreaming,
        agentType,
        sendMessage,
        loadMessages,
        clearMessages,
    } = useChat({
        userId,
        conversationId: conversationId || undefined,
        onConversationCreated,
    });

    const prevIdRef = useRef<string | null>(null);

    useEffect(() => {
        const prevId = prevIdRef.current;
        prevIdRef.current = conversationId || null;

        if (conversationId) {
            // If we just created a conversation (id changed from null -> value)
            // AND we are streaming content, DO NOT load from DB yet.
            // Loading from DB would overwrite our local streaming state with the (yet incomplete) DB state.
            if (!prevId && isStreaming) {
                return;
            }
            loadMessages(conversationId);
        } else {
            clearMessages();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, loadMessages, clearMessages]);

    return (
        <main className="chat-view">
            <div className="chat-header">
                <h3>{conversationId ? "Conversation" : "New Chat"}</h3>
                {agentType && (
                    <span className={`agent-indicator agent-${agentType}`}>
                        {agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent
                    </span>
                )}
            </div>
            <div className="chat-messages">
                <MessageList
                    messages={messages}
                    isStreaming={isStreaming}
                    agentType={agentType}
                />
            </div>
            <div className="chat-footer">
                <ChatInput onSend={sendMessage} disabled={isStreaming} />
            </div>
        </main>
    );
}
