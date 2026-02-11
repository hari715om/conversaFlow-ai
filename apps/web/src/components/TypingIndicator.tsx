import { useState, useEffect } from "react";

const INDICATOR_WORDS = [
    "Thinking",
    "Analyzing",
    "Searching",
    "Processing",
    "Looking up",
    "Checking",
    "Reviewing",
];

interface TypingIndicatorProps {
    agentType?: string | null;
}

export function TypingIndicator({ agentType }: TypingIndicatorProps) {
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % INDICATOR_WORDS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const agentLabel = agentType
        ? agentType.charAt(0).toUpperCase() + agentType.slice(1) + " Agent"
        : "Agent";

    return (
        <div className="typing-indicator">
            <div className="typing-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
            </div>
            <span className="typing-text">
                {agentLabel} is {INDICATOR_WORDS[wordIndex].toLowerCase()}...
            </span>
        </div>
    );
}
