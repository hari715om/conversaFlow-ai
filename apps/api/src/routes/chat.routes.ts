import { Hono } from "hono";
import { chatController } from "../controllers/chat.controller";

export const chatRoutes = new Hono()
    .post("/messages", (c) => chatController.sendMessage(c))
    .get("/conversations", (c) => chatController.getConversations(c))
    .get("/conversations/:id", (c) => chatController.getConversation(c))
    .delete("/conversations/:id", (c) => chatController.deleteConversation(c));
