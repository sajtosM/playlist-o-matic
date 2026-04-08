# Phase 1: Dependency Swap - Context

**Gathered:** 8 April 2026
**Status:** Ready for planning

<domain>
## Phase Boundary

Update `package.json` to replace all LangChain packages with Vercel AI SDK packages, remove dead/unused packages, add zod as a direct dependency, clean up the `overrides` block, update `tsconfig.json` for correct module resolution, and verify `npm install` completes cleanly.

New capabilities (rewriting `createCategories.ts`, cleaning `youtubeSumm.ts`) are out of scope — those are Phases 2 and 3.

</domain>

<decisions>
## Implementation Decisions

### Packages to Add
- **D-01:** Add `ai` (Vercel AI SDK core), `@ai-sdk/openai`, `@ai-sdk/ollama` as production dependencies. Use `^4.x` caret ranges, consistent with existing project style.
- **D-02:** Add `zod` as a direct production dependency (currently implicit transitive via LangChain; used explicitly in `createCategories.ts` and must stay resolvable after LangChain removal).

### Packages to Remove
- **D-03:** Remove ALL LangChain packages from `dependencies`: `langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama`.
- **D-04:** Remove dead/unused packages from `dependencies`: `youtubei.js`, `meow`, `compromise`, `camelcase`. Also remove `@types/natural`, `natural`, `wink-pos-tagger` if not used outside dead code paths (verify before removing).
- **D-05:** Remove the `overrides` block for `buffer-equal-constant-time` — this shim was almost certainly only needed by a LangChain transitive dep. The `shims/` directory in the repo can remain untouched (non-destructive).

### TypeScript Config
- **D-06:** Update `tsconfig.json` in Phase 1 (not deferred to Phase 2). The Vercel AI SDK requires `moduleResolution: "bundler"` or `"node16"` to resolve package exports correctly. Verify the chosen resolution mode doesn't break `ts-node` or existing imports before committing. If `bundler` causes issues with `ts-node`, fall back to `node16`.

### the agent's Discretion
- Version selection: Pick the latest stable `^4.x` of `ai`, `@ai-sdk/openai`, `@ai-sdk/ollama` at time of install. No need to pin exact versions.
- Whether to run `npm install` with `--legacy-peer-deps` if peer dep conflicts arise — agent can resolve without asking.
- Whether to add `@ai-sdk/ollama` types separately or whether they're bundled — check SDK docs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/PROJECT.md` — Active requirements list, constraints, key decisions
- `.planning/REQUIREMENTS.md` — DEP-01, DEP-02, DEP-03 acceptance criteria

### Codebase
- `package.json` — Current dependency state (source of truth for what to remove)
- `tsconfig.json` — Current TypeScript config (needs `moduleResolution` update)
- `src/service/createCategories.ts` — Uses `zod` explicitly (reason zod must be direct dep)
- `.planning/codebase/STACK.md` — Full current stack analysis with package versions

### External
- No external specs — decisions fully captured above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shims/buffer-equal-constant-time/` — Local shim directory; leave in place (overrides block removed from package.json, but shim files are harmless).

### Established Patterns
- `package.json` uses `^x.y.z` caret ranges for all dependencies — match this style for Vercel AI SDK additions.
- `tsconfig.json` currently: `target: "ES2021"`, `module: "CommonJS"`, `moduleResolution` not explicitly set (defaults to `"node"` for CommonJS). Needs `"node16"` or `"bundler"` for Vercel AI SDK to resolve properly.

### Integration Points
- `ts-node` is used for `npm start` — `moduleResolution` change must remain compatible with `ts-node`.
- `jest` + `ts-jest` + `babel.config.js` for tests — don't break the test pipeline.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard Vercel AI SDK installation approach.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-dependency-swap*
*Context gathered: 8 April 2026*
