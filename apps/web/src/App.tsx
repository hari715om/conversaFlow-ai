import { useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";

const DEFAULT_USER_ID = "user_alice";

export default function App() {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [chatKey, setChatKey] = useState(0);

    const handleNewChat = useCallback(() => {
        setActiveConversationId(null);
        setChatKey((prev) => prev + 1);
    }, []);

    const handleSelectConversation = useCallback((id: string) => {
        setActiveConversationId(id);
        setChatKey((prev) => prev + 1);
    }, []);

    const handleConversationCreated = useCallback((id: string) => {
        setActiveConversationId(id);
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <div className="app-layout">
            <Sidebar
                userId={DEFAULT_USER_ID}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                refreshTrigger={refreshTrigger}
            />
            <ChatView
                key={chatKey}
                userId={DEFAULT_USER_ID}
                conversationId={activeConversationId}
                onConversationCreated={handleConversationCreated}
            />
        </div>
    );
}
