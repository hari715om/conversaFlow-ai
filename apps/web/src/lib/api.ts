const API_BASE = "/api";

export interface Conversation {
    id: string;
    title: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
    _count?: { messages: number };
}

export interface Message {
    id: string;
    conversationId: string;
    role: "user" | "assistant" | "system";
    content: string;
    agentType?: string | null;
    createdAt: string;
}

export interface Agent {
    type: string;
    name: string;
    description: string;
    capabilities: string[];
}

export const api = {
    async sendMessage(
        userId: string,
        message: string,
        conversationId?: string
    ): Promise<Response> {
        return fetch(`${API_BASE}/chat/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, message, conversationId }),
        });
    },

    async getConversations(userId: string): Promise<Conversation[]> {
        const res = await fetch(`${API_BASE}/chat/conversations?userId=${userId}`);
        const data = await res.json();
        return data.data;
    },

    async getConversation(conversationId: string): Promise<Conversation> {
        const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`);
        const data = await res.json();
        return data.data;
    },

    async deleteConversation(conversationId: string): Promise<void> {
        await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
            method: "DELETE",
        });
    },

    async getAgents(): Promise<Agent[]> {
        const res = await fetch(`${API_BASE}/agents`);
        const data = await res.json();
        return data.data;
    },
};
