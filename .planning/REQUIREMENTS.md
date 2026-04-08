# Requirements: playlist-o-matic

**Defined:** 8 April 2026
**Core Value:** Accurate, structured LLM-driven categorization of YouTube watchlist videos using Vercel AI SDK `generateObject()` for reliable structured output across both OpenAI and Ollama.

## v1 Requirements

Requirements for the AI SDK migration milestone.

### Dependency Migration

- [ ] **DEP-01**: Replace `langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama` with `ai`, `@ai-sdk/openai`, `@ai-sdk/ollama` in `package.json`
- [ ] **DEP-02**: Remove unused dead packages: `youtubei.js`, `meow`, `compromise`, `camelcase` from `package.json`
- [ ] **DEP-03**: `npm install` succeeds with updated dependencies and no import errors

### Categorization Rewrite

- [ ] **CAT-01**: `createCategories.ts` uses `generateObject()` from Vercel AI SDK instead of LangChain chain/pipe pattern
- [ ] **CAT-02**: Same Zod schema is used (`category` enum, `reason` string, optional `rating` number)
- [ ] **CAT-03**: OpenAI path (default) uses `@ai-sdk/openai` provider with model `gpt-4o-mini`
- [ ] **CAT-04**: Ollama path (`--ollama` flag) uses `@ai-sdk/ollama` provider with model from `OLLAMA_MODEL` env
- [ ] **CAT-05**: `OLLAMA_THINK` env flag (`true`/`false`) is passed through to Ollama `providerOptions`
- [ ] **CAT-06**: Existing deduplication logic (skip already-categorized videos) is preserved
- [ ] **CAT-07**: Channel category hint enrichment is preserved
- [ ] **CAT-08**: Output written to `data/watchlistCategory.json` in the same format as before

### Dead Code Cleanup

- [ ] **DEAD-01**: `youtubeSumm.ts` removes all LangChain imports (`langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama`)
- [ ] **DEAD-02**: `youtubeSumm.ts` retains function signatures (`getYoutubeInfo`, `getYoutubeSummary`) as stubs returning `null`/placeholder strings
- [ ] **DEAD-03**: `TypeScript` compilation (`npm run build`) succeeds with no errors after all changes

## v2 Requirements

Deferred to future release.

### Performance

- **PERF-01**: Parallel/batched LLM calls for large watchlists (100+ videos)
- **PERF-02**: Exponential backoff and retry logic for API quota errors

### YouTube Summary Revival

- **SUMM-01**: `youtubeSumm.ts` revived with working YouTube video content loader
- **SUMM-02**: `processPlaylist.ts` uses working summarization pipeline

### Code Quality

- **QUAL-01**: Replace `process.argv` positional parsing with `meow` or `yargs`
- **QUAL-02**: Centralize `dotenv.config()` to entry point only
- **QUAL-03**: Fix `renderCategories()` filename bug (condition inverted)
- **QUAL-04**: Type YouTube API responses (remove `any` types)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rewriting `processPlaylist.ts` | Imports broken `getYoutubeSummary`; left intact — not part of this migration |
| Fixing `renderCategories()` filename bug | Separate bug fix, not part of AI SDK migration |
| UI or web server | CLI-only tool by design |
| Streaming output (`streamObject`) | Not needed for batch CLI workflow |
| Changing Zod schema shape | Schema is correct and stable; changing it would break existing `data/watchlistCategory.json` files |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEP-01 | Phase 1 | Pending |
| DEP-02 | Phase 1 | Pending |
| DEP-03 | Phase 1 | Pending |
| CAT-01 | Phase 2 | Pending |
| CAT-02 | Phase 2 | Pending |
| CAT-03 | Phase 2 | Pending |
| CAT-04 | Phase 2 | Pending |
| CAT-05 | Phase 2 | Pending |
| CAT-06 | Phase 2 | Pending |
| CAT-07 | Phase 2 | Pending |
| CAT-08 | Phase 2 | Pending |
| DEAD-01 | Phase 3 | Pending |
| DEAD-02 | Phase 3 | Pending |
| DEAD-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 8 April 2026*
*Last updated: 8 April 2026 after initialization*
