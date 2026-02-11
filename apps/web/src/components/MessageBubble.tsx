import type { Message } from "../lib/api";
import { TypingIndicator } from "./TypingIndicator";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`message-row ${isUser ? "message-user" : "message-assistant"}`}>
            <div className={`message-bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
                {!isUser && message.agentType && (
                    <span className="agent-badge">{message.agentType}</span>
                )}
                {message.content ? (
                    <p className="message-content">{message.content}</p>
                ) : !isUser ? (
                    <TypingIndicator agentType={message.agentType} />
                ) : null}
            </div>
        </div>
    );
}
