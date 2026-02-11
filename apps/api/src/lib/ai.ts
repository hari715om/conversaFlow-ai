import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export const model = groq("llama-3.1-8b-instant");

export const classifierModel = groq("llama-3.1-8b-instant");
