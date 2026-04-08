# playlist-o-matic

## What This Is

A CLI tool that reads a YouTube watchlist export, uses an LLM to categorize videos into user-defined topic buckets, and pushes organized playlists back to YouTube via the Data API v3. It supports both OpenAI (GPT-4o-mini) and local Ollama models as AI backends.

## Core Value

Accurate, structured LLM-driven categorization of YouTube watchlist videos — using Vercel AI SDK `generateObject()` for reliable structured output across both OpenAI and Ollama.

## Requirements

### Validated

- ✓ Read category list from file and filter/normalize paths — existing
- ✓ Read watchlist JSON and skip already-categorized videos — existing
- ✓ Use Zod schema for structured LLM output (category + reason) — existing
- ✓ Support OpenAI (GPT-4o-mini) and Ollama backends — existing
- ✓ Write categorized results to `data/watchlistCategory.json` — existing
- ✓ Render categorized watchlist to markdown — existing
- ✓ Create YouTube playlists from categorized watchlist — existing
- ✓ Read channel list to enrich category hints — existing

### Active

- [ ] Replace LangChain (`langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama`) with Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/ollama`)
- [ ] Rewrite `createCategories.ts` using `generateObject()` — drop `ChatPromptTemplate`, chain syntax
- [ ] Wire `OLLAMA_THINK` env flag into Ollama `providerOptions`
- [ ] Clean up `youtubeSumm.ts` — remove LangChain imports, keep function stubs for future revival
- [ ] Remove unused dead packages: `youtubei.js`, `meow`, `compromise`, `camelcase`

### Out of Scope

- Rewriting `processPlaylist.ts` — depends on broken `getYoutubeSummary`, but left intact for now
- Fixing `renderCategories()` filename bug — separate concern, not part of this migration
- Adding parallel/batched AI calls — performance optimization for a future milestone
- UI or server layer — this is a CLI tool only

## Context

- The project already has a codebase map at `.planning/codebase/`
- `youtubeSumm.ts` is mostly dead code — the YouTube loader was deprecated and commented out; `getYoutubeInfo()` always returns `null`. The function stubs should stay but LangChain deps must go.
- `OLLAMA_THINK=false` already exists in `.env` — wire it through to `providerOptions` in the Ollama path
- `zod` is already present as a transitive dep (stays — Zod schema is unchanged)
- TypeScript config targets ES2021, CommonJS — no module system changes needed
- The Vercel AI SDK uses ESM natively but works with CommonJS via `ai` package bundling; `tsconfig` may need `moduleResolution: bundler` or `node16`

## Constraints

- **Tech Stack**: Must use Vercel AI SDK (`ai` ^4.x, `@ai-sdk/openai`, `@ai-sdk/ollama`) — no other AI framework
- **Schema**: Existing Zod classification schema must be preserved exactly (category enum, reason, optional rating)
- **Compatibility**: TypeScript + CommonJS module system must continue to work with `ts-node`
- **Secrets**: API keys remain in `.env` — no changes to secret handling

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `generateObject()` not `streamObject()` | Batch CLI tool — no streaming needed | — Pending |
| Keep `youtubeSumm.ts` as stub | May be revived when YouTube loader alternative found | — Pending |
| Remove dead packages alongside LangChain | Reduces install size and attack surface, part of same cleanup milestone | — Pending |
| Wire `OLLAMA_THINK` via `providerOptions` | Already in `.env`, makes think mode toggleable without code changes | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 8 April 2026 after initialization*
