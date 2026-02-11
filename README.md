# ConversaFlow AI

AI-powered customer support system with multi-agent architecture built with **Hono**, **React**, **Prisma**, and **Vercel AI SDK**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                 │
│  Sidebar ─── ChatView ─── MessageList ─── TypingIndicator      │
│                    │                                            │
│              Streaming fetch (/api/chat/messages)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     API LAYER (Hono)                            │
│  Routes ──► Controller ──► Service                              │
│                              │                                  │
│                     Error Middleware (global)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   AI ORCHESTRATION                              │
│  Router Agent (8b classifier)                                   │
│       │                                                         │
│       ├── Support Agent ──► Support Tools ──► Support Service   │
│       ├── Order Agent   ──► Order Tools   ──► Order Service     │
│       └── Billing Agent ──► Billing Tools ──► Billing Service   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     DATA LAYER                                  │
│  Prisma ORM ──► PostgreSQL                                     │
│  Models: User, Conversation, Message, Order, Payment, FAQ       │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### Why Controller-Service-Agent Separation?
Controllers are thin — they only extract request data and return responses. Services contain business logic. Agents handle AI orchestration. Tools bridge AI and data. This separation means each layer can be tested and modified independently.

### Why Two Groq Models?
- **`llama-3.1-8b-instant`** for the Router Agent — fast, cheap intent classification (returns a single word)
- **`llama-3.3-70b-versatile`** for Sub-agents — better reasoning for tool usage and conversation

### Why LLM-based Routing with Fallback?
The Router Agent uses LLM classification for flexibility (handles natural language nuance), but defaults to `support` on any error. This ensures the system never breaks on unclassifiable queries.

### Context Compaction
Before sending messages to AI, we estimate token count and trim old messages if over budget (4000 tokens). System messages are always preserved. This prevents token limit errors on long conversations.

### Streaming Architecture
`streamText()` from Vercel AI SDK generates a data stream. The backend tees the stream — one copy goes to the client, the other is captured to save the full response in the DB.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm |
| Backend | Hono (Node.js) |
| Frontend | React + Vite |
| Database | PostgreSQL + Prisma |
| AI | Vercel AI SDK + Groq |
| Type Safety | Hono RPC, Zod |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/chat/messages` | Send message → stream AI response |
| `GET` | `/api/chat/conversations` | List user conversations |
| `GET` | `/api/chat/conversations/:id` | Get conversation with messages |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation |
| `GET` | `/api/agents` | List available agents |
| `GET` | `/api/agents/:type/capabilities` | Get agent capabilities |
| `GET` | `/api/health` | Health check |

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL running locally

### 1. Clone and Install

```bash
git clone <repo-url>
cd conversaFlow-ai
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/conversaflow
GROQ_API_KEY=your_groq_api_key_here
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 3. Setup Database

```bash
cd apps/api
npx prisma db push
npx prisma db seed
# OR
pnpm db:push
pnpm db:seed
```

### 4. Run Development Servers

```bash
# From root — starts both API (port 3001) and Web (port 5173)
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Agent System

### Router Agent
Classifies each user message into `support`, `order`, or `billing` using the fast 8b model. Falls back to `support` on errors.

### Support Agent
- **searchFAQ** — word-level matching against FAQ database
- **queryConversationHistory** — retrieves recent conversations for context

### Order Agent
- **createOrder** — create a new order for the user
- **getOrderDetails** — full order information by order number
- **checkDeliveryStatus** — tracking, shipping, estimated delivery
- **listUserOrders** — all orders for a user

### Billing Agent
- **getInvoiceDetails** — invoice lookup by number (includes linked order reference)
- **checkPaymentStatus** — payment method, status, and related order
- **checkRefundStatus** — refund eligibility, reason, and linked order

## Bonus Features Implemented

- ✅ Turborepo monorepo with Hono RPC type safety
- ✅ Streaming responses with SSE
- ✅ AI reasoning indicator (animated typing with status words)
- ✅ Context compaction (token-aware message trimming)
- ✅ Error handling middleware
