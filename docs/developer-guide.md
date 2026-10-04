# Developer Guide — Dhaga & Co. Intelligence Radar

## Architecture Overview

```
Client Browser (React SPA)
       │
       ▼ (HTTP /api/*)
Express Backend Proxy (server.ts)
  ├── Structured Logger (src/server/logger.ts) [Auto Regex Sanitizer]
  ├── Pipeline Engine (src/server/pipeline.ts) [4 Patterns: Chaining, Parallel, Routing, Evaluator]
  ├── OpenRouter Client (src/server/openrouter.ts) [Bearer sk-or-***]
  └── In-Memory / Deterministic Benchmark (src/server/data.ts)
       │
       ▼ (Secure Server-to-Server)
OpenRouter Gateway (https://openrouter.ai/api/v1)
  ├── Fast Model: google/gemini-2.5-flash
  └── Judge Model: anthropic/claude-3.5-sonnet
```

## Security Best Practices
- Never commit `.env` or API keys.
- Keep `OPENROUTER_API_KEY` on the server.
- The client communicates only via `/api/radar/*` and `/api/logs`.
- Logs strip all `sk-or-*` and authorization headers automatically.

## Running Tests
```bash
npm run lint    # TypeScript typecheck
npm run build   # Production asset compilation
npm run dev     # Full-stack dev server on port 3000
```
