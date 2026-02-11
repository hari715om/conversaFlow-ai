import { useEffect, useState } from "react";
import { api, type Conversation } from "../lib/api";

interface SidebarProps {
    userId: string;
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    refreshTrigger: number;
}

export function Sidebar({
    userId,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    refreshTrigger,
}: SidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        api.getConversations(userId).then(setConversations).catch(console.error);
    }, [userId, refreshTrigger]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await api.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
            onNewChat();
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>ConversaFlow</h2>
                <button className="new-chat-btn" onClick={onNewChat}>
                    + New Chat
                </button>
            </div>
            <div className="conversation-list">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        className={`conversation-item ${conv.id === activeConversationId ? "active" : ""}`}
                        onClick={() => onSelectConversation(conv.id)}
                    >
                        <span className="conversation-title">
                            {conv.title || "New Conversation"}
                        </span>
                        <button
                            className="delete-btn"
                            onClick={(e) => handleDelete(e, conv.id)}
                            title="Delete"
                        >
                            ×
                        </button>
                    </div>
                ))}
                {conversations.length === 0 && (
                    <p className="no-conversations">No conversations yet</p>
                )}
            </div>
            <div className="sidebar-footer">
                <div className="user-info">
                    <span className="user-avatar">👤</span>
                    <span className="user-name">Alice Johnson</span>
                </div>
            </div>
        </aside>
    );
}
