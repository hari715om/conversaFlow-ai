import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { chatRoutes } from "./routes/chat.routes";
import { agentsRoutes } from "./routes/agents.routes";
import { healthRoutes } from "./routes/health.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = new Hono();

app.use(
    "/*",
    cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["X-Conversation-Id", "X-Agent-Type"],
    })
);

app.onError(errorHandler);

const routes = app
    .route("/api/chat", chatRoutes)
    .route("/api/agents", agentsRoutes)
    .route("/api/health", healthRoutes);

export type AppType = typeof routes;

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, () => {
    console.log(`ConversaFlow API running on http://localhost:${port}`);
});
