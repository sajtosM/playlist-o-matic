# Roadmap: playlist-o-matic

**Milestone:** AI SDK Migration (v1)
**Created:** 8 April 2026
**Granularity:** Standard (3 phases — derived from requirement categories)

## Phases

- [ ] **Phase 1: Dependency Swap** - Update package.json, remove LangChain and dead packages, npm install
- [ ] **Phase 2: Categorization Rewrite** - Rewrite createCategories.ts with Vercel AI SDK generateObject()
- [ ] **Phase 3: Dead Code Cleanup** - Remove LangChain imports from youtubeSumm.ts, verify build passes

## Phase Details

### Phase 1: Dependency Swap
**Goal**: Project installs cleanly with Vercel AI SDK replacing LangChain and dead packages removed
**Depends on**: Nothing
**Requirements**: DEP-01, DEP-02, DEP-03
**Success Criteria** (what must be TRUE):
  1. `package.json` lists `ai`, `@ai-sdk/openai`, `@ai-sdk/ollama` and has no LangChain packages (`langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama`)
  2. `package.json` has no entries for `youtubei.js`, `meow`, `compromise`, or `camelcase`
  3. `npm install` completes without errors and `node_modules` reflects the new dependency set
**Plans**: 1 plan
- [ ] 01-01-PLAN.md — Swap packages in package.json, update tsconfig.json moduleResolution, run npm install

### Phase 2: Categorization Rewrite
**Goal**: `createCategories.ts` categorizes videos using Vercel AI SDK `generateObject()` for both OpenAI and Ollama backends with all existing behavior preserved
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04, CAT-05, CAT-06, CAT-07, CAT-08
**Success Criteria** (what must be TRUE):
  1. Running the CLI (default path) hits `generateObject()` from `ai` package and produces `data/watchlistCategory.json` with the same schema as before
  2. Running with `--ollama` flag routes through `@ai-sdk/ollama`; `OLLAMA_THINK=true/false` is propagated as `providerOptions`
  3. Videos already present in `data/watchlistCategory.json` are skipped — deduplication logic unchanged
  4. Channel category hints are included in the LLM prompt — enrichment logic unchanged
  5. The Zod schema (`category` enum, `reason` string, optional `rating` number) is unchanged from pre-migration
**Plans**: TBD

### Phase 3: Dead Code Cleanup
**Goal**: `youtubeSumm.ts` is free of LangChain imports and the TypeScript build passes with no errors
**Depends on**: Phase 2
**Requirements**: DEAD-01, DEAD-02, DEAD-03
**Success Criteria** (what must be TRUE):
  1. `youtubeSumm.ts` contains no imports from `langchain`, `@langchain/core`, `@langchain/openai`, or `@langchain/ollama`
  2. `getYoutubeInfo()` and `getYoutubeSummary()` function signatures remain intact, returning `null` and a placeholder string respectively
  3. `npm run build` (tsc) exits with code 0 and produces no type errors
**Plans**: TBD

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dependency Swap | 0/1 | Not started | - |
| 2. Categorization Rewrite | 0/1 | Not started | - |
| 3. Dead Code Cleanup | 0/1 | Not started | - |
