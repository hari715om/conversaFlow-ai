import { useEffect, useRef } from "react";
import type { Message } from "../lib/api";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
    messages: Message[];
    isStreaming: boolean;
    agentType: string | null;
}

export function MessageList({ messages, isStreaming, agentType }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    if (messages.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Start a Conversation</h3>
                <p>Ask about orders, billing, or general support.</p>
                <div className="example-queries">
                    <span className="example-chip">What's the status of ORD-001?</span>
                    <span className="example-chip">I need a refund for INV-004</span>
                    <span className="example-chip">How do I reset my password?</span>
                </div>
            </div>
        );
    }

    return (
        <div className="message-list">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
                <TypingIndicator agentType={agentType} />
            )}
            <div ref={bottomRef} />
        </div>
    );
}
