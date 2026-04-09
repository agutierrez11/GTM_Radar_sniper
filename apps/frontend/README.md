# 🛰️ NERV: Operation Nexo

> **The Neural System of the Latam Fintech Ecosystem.**
> Integrated GTM Intelligence powered by RaiSE v3.1 Swarm Engine.

## 📖 Concepts & Glossary

To ensure alignment across the new co-founding team, we follow two foundational pillars:

- **RaiSE (Reliable AI-assisted Strategic Engineering)**: Our proprietary forensic protocol (v3.1). Unlike standard LLM generation, RaiSE forces the AI to follow a multi-stage deduction path: *Signals -> Hypothesis -> Friction -> Resolution*. It eliminates "ghost data" and ensures McKinsey-grade strategic output.
- **MiroFish (Swarm Benchmark)**: We leverage MiroFish-inspired **Swarm Intelligence**. Instead of a single model pass, we orchestrate an internal "Arena" where multiple agents (Harvester, Challenger, Synthesizer) debate the strategy. This ensures higher accuracy and stress-tests every sales argument before it reaches the human user.

## 🧠 Core Architecture: Operation Nexo

The engine operates under the **RaiSE (Reliable AI-assisted Strategic Engineering)** protocol, a 4-stage forensic deduction framework:

1.  **Forensic Hypothesis**: Deducing the "Shadow Pain" of a target company based on market signals.
2.  **Technical Friction**: Identifying the specific architectural hurdles preventing the target from solving that pain.
3.  **Financial Risk**: Quantifying the cost of inaction (Churn, Fraud losses, OPEX).
4.  **Tactical Resolution**: Generating an "Opening Argument" and a specific attack plan for sales pods.

## 🛠 Tech Stack

- **Frontend**: Next.js 15.2 (React 19) + TailwindCSS 4 + Framer Motion.
- **Backend**: Next.js API Routes (Serverless).
- **AI Core**: Google Gemini 2.0 Flash (Stable) + Claude 3.5 (Audit Layer).
- **Resilience**: Adaptive API Key Rotation & Multi-Model Fallback system (`lib/gemini.ts`).
- **Database**: Supabase (PostgreSQL) + pgvector (Enabling RAG).

## 🚀 Roadmap: Towards Swarm Intelligence (v3.0)

Current work is focused on evolving from single-agent linear inference to **Universal Swarm Intelligence**, inspired by the MiroFish architecture:

- **[ ] Vector Memory (RAG)**: Full knowledge graph integration using Supabase pgvector.
- **[ ] Agentic Debate (ReACT)**: Implementation of a multi-perspective reasoning loop (Investigate -> Critique -> Synthesize).
- **[ ] Social Simulation**: Predictive modeling of market reactions using autonomous agent swarms.

## 👨‍💻 Onboarding for Co-Founders

Welcome to the bridge. To get started:

1.  **Review the Core**: Check `src/app/api/nexus/route.ts` for the main intelligence pipeline.
2.  **Resilience Layer**: Study `src/lib/gemini.ts` to understand how we manage quota and failover across multiple API keys.
3.  **Database Schema**: See `supabase_schema.sql` for the current data structure.
4.  **Environment**: Copy `.env.example` (provided in the repo) and fill in your keys.

---
*NERV - Confidential GTM Infrastructure*
