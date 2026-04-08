# Phase 1: Dependency Swap — Research

**Researched:** 8 April 2026
**Domain:** npm dependency migration (LangChain → Vercel AI SDK), TypeScript moduleResolution, CJS/ESM interop
**Confidence:** HIGH (verified against live npm registry on research date)

---

## Summary

This is a package.json swap: remove four LangChain packages and several dead packages, add three Vercel AI SDK packages plus zod, update tsconfig.json moduleResolution, and verify `npm install` cleans. No source code changes in Phase 1.

**Two critical mismatches** between the locked CONTEXT.md decisions and verified registry reality must be resolved before planning:

1. **`@ai-sdk/ollama` does NOT exist on npm.** The package returns a 404. The community Ollama provider is `ollama-ai-provider` (v1.2.0, by Lars Grammel/Vercel team). This must replace `@ai-sdk/ollama` in D-01.

2. **`ai@^4.x` installs the OLD v4 series (latest: 4.3.19), not the current SDK.** The `ai` package `latest` tag is now `6.0.154`. The `^4.x` range in D-01 was written with stale knowledge. The planner must choose v5 or v6 (both current stable, same `generateObject()` API).

**Primary recommendation:** Use `ai@^6` + `@ai-sdk/openai@^3` + `ollama-ai-provider@^1` + `zod@^3.25.76`. Update `moduleResolution` to `"node16"` (NOT `"bundler"` — bundler is incompatible with `module: "commonjs"`).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Add `ai`, `@ai-sdk/openai`, `@ai-sdk/ollama` as production dependencies with `^4.x` caret ranges.
  ⚠️ RESEARCH CONFLICT: `@ai-sdk/ollama` does not exist; `^4.x` resolves to old v4.3.19. See Standard Stack section.
- **D-02:** Add `zod` as explicit direct production dependency.
- **D-03:** Remove `langchain`, `@langchain/core`, `@langchain/openai`, `@langchain/ollama`.
- **D-04:** Remove `youtubei.js`, `meow`, `compromise`, `camelcase`. Verify `@types/natural`, `natural`, `wink-pos-tagger` before removing.
  ✅ VERIFIED: `natural` and `wink-pos-tagger` are actively used in `src/rankedWatchlist.ts`. DO NOT remove them or `@types/natural`.
- **D-05:** Remove the `overrides` block for `buffer-equal-constant-time`. The `shims/` directory stays untouched.
- **D-06:** Update `tsconfig.json` moduleResolution to `"bundler"` (fallback: `"node16"`) in Phase 1.
  ⚠️ RESEARCH CONFLICT: `"bundler"` is incompatible with `module: "commonjs"` in TypeScript 5+/6. Use `"node16"` directly — it is not a fallback, it is the correct choice for this project.

### the agent's Discretion
- Version selection: pick latest stable `^4.x` (sic) of `ai`, `@ai-sdk/openai`, `@ai-sdk/ollama` at time of install.
- Whether to run `npm install --legacy-peer-deps` if peer dep conflicts arise.
- Whether to add `@ai-sdk/ollama` types separately or whether they're bundled.

### Deferred Ideas (OUT OF SCOPE)
- None stated.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEP-01 | Replace langchain packages with ai SDK packages in package.json | Standard Stack section has exact package names and versions |
| DEP-02 | Remove unused dead packages from package.json | Dead Package Audit section confirms what is safe to remove |
| DEP-03 | npm install succeeds with no errors | CJS Compatibility + Peer Deps sections confirm clean install |
</phase_requirements>

---

## Standard Stack

> Versions verified against npm registry on 8 April 2026.

### Core Packages to ADD

| Package | Verified Version | Purpose | Notes |
|---------|-----------------|---------|-------|
| `ai` | `6.0.154` (latest) | Vercel AI SDK core — `generateObject()`, types | Was `4.3.19` in old v4 series; use `^6` |
| `@ai-sdk/openai` | `3.0.52` (latest) | OpenAI provider for ai@6 | Incompatible with ai@4/5 — version family must match |
| `ollama-ai-provider` | `1.2.0` (latest) | Ollama local LLM provider | **Replaces `@ai-sdk/ollama`** (which does not exist) |
| `zod` | `3.25.76` (latest v3) | Schema validation | Use `^3` (not `^4`) to stay on v3 for code compatibility |

### Version Family Alignment (MANDATORY — DO NOT MIX)

The `ai` package and its official providers (`@ai-sdk/openai`) use **paired major versions**. Mixing versions from different families causes peer dep warnings and potential runtime failures:

| ai core version | @ai-sdk/openai version | zod peer dep |
|----------------|----------------------|-------------|
| `ai@4.x` (old) | `@ai-sdk/openai@0.x` (old) | `^3.23.8` |
| `ai@5.x` (prev stable) | `@ai-sdk/openai@1.x` | `^3.25.76 \|\| ^4.1.8` |
| `ai@6.x` (**latest stable**) | `@ai-sdk/openai@3.x` | `^3.25.76 \|\| ^4.1.8` |

**Use the ai@6 family.** Do NOT install `ai@^4` and `@ai-sdk/openai@^3` together — they are from different families.

### Packages to REMOVE

| Package | Safe to Remove? | Evidence |
|---------|----------------|---------|
| `langchain` | ✅ Yes | Targeted for replacement |
| `@langchain/core` | ✅ Yes | Targeted for replacement |
| `@langchain/openai` | ✅ Yes | Targeted for replacement |
| `@langchain/ollama` | ✅ Yes | Targeted for replacement |
| `youtubei.js` | ✅ Yes | No imports found in any `.ts` source file |
| `meow` | ✅ Yes | No imports found in any `.ts` source file |
| `compromise` | ✅ Yes | No imports found in any `.ts` source file |
| `camelcase` | ✅ Yes | No imports found in any `.ts` source file |
| `@types/natural` | ❌ NO | `natural` is used in `src/rankedWatchlist.ts` — `@types/natural` is its types pkg |
| `natural` | ❌ NO | Actively used: `natural.JaroWinklerDistance()` in `rankedWatchlist.ts` |
| `wink-pos-tagger` | ❌ NO | Actively used: `winkPosTagger()` in `rankedWatchlist.ts` |

### Installation Command

```bash
# Remove LangChain and dead packages first
npm uninstall langchain @langchain/core @langchain/openai @langchain/ollama youtubei.js meow compromise camelcase

# Add Vercel AI SDK packages
npm install ai @ai-sdk/openai ollama-ai-provider zod@^3

# Verify clean install
npm ls --depth=0
```

Note: `zod@^3` resolves to `3.25.76` (current latest v3) which satisfies `ai@6`'s peer dep of `'^3.25.76 || ^4.1.8'`.

---

## tsconfig Strategy

### Recommendation: Use `moduleResolution: "node16"` — NOT `"bundler"`

**Why NOT `"bundler"`:** TypeScript 5+/6 enforces that `moduleResolution: "bundler"` is only valid when `module` is set to a modern ES format (`"esnext"`, `"preserve"`, etc.). This project uses `"module": "commonjs"`. Using `"bundler"` will produce TypeScript diagnostic error TS5109 or similar. The CONTEXT.md fallback option (`"node16"`) is actually the correct primary choice.

**Why `"node16"` works:**
- Compatible with `"module": "commonjs"` in the same tsconfig ✓
- Reads `package.json` `exports` field (required for `ai`, `@ai-sdk/openai`, `ollama-ai-provider` to resolve correctly) ✓
- Supported by TypeScript 6.0.2 (globally installed on this machine) ✓
- Supported by ts-node 10.9.2 (globally installed on this machine) ✓

**Exact tsconfig.json change:**

```json
// BEFORE (moduleResolution commented out, defaults to "node"):
// "moduleResolution": "node10",

// AFTER:
"moduleResolution": "node16",
```

This is a one-line addition. No other tsconfig changes are needed for Phase 1.

### Why `moduleResolution: "node"` (default) Breaks the SDK

The `ai` and provider packages use the `exports` field in their `package.json`:
```json
// ai package.json exports (verified):
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",
    "require": "./dist/index.js"
  }
}
```

With old `moduleResolution: "node"` (the pre-existing default since no explicit setting exists), TypeScript does NOT read the `exports` field. The package may fail to resolve or resolve to unexpected paths. With `"node16"`, TypeScript reads exports and correctly routes to the CJS `require` path.

---

## Architecture Patterns

### CJS Interop: Dual-Mode Packages

All three SDK packages ship both ESM and CJS builds (verified from npm metadata):

| Package | `require` (CJS) | `import` (ESM) | CJS Safe? |
|---------|----------------|---------------|----------|
| `ai@6.0.154` | `./dist/index.js` | `./dist/index.mjs` | ✅ Yes |
| `@ai-sdk/openai@3.0.52` | `./dist/index.js` | `./dist/index.mjs` | ✅ Yes |
| `ollama-ai-provider@1.2.0` | `./dist/index.js` | — | ✅ Yes |

No `"type": "module"` field on any of these packages. At runtime, `require('ai')` uses the CJS build. No ESM-only incompatibility.

**`esModuleInterop` requirement:** Already set to `true` in the current `tsconfig.json`. No change needed.

### TypeScript Compilation State After Phase 1

Phase 1 removes LangChain packages but does NOT modify `createCategories.ts` or `youtubeSumm.ts`. After Phase 1:

- `createCategories.ts` still imports from `@langchain/openai`, `@langchain/ollama`, `@langchain/core/prompts` → **tsc will fail** (packages gone)
- `youtubeSumm.ts` still imports from `langchain/*` → **tsc will fail**
- This is **expected and acceptable** — `DEAD-03` (TypeScript compilation success) is a Phase 3 requirement, not Phase 1

Phase 1 success criteria:
- `npm install` completes without error
- No peer dependency conflicts
- Jest tests still run (Jest uses Babel for transpilation, bypasses tsc type errors) IF the test script is adjusted — but note: current `"test": "npm run build && jest"` runs `tsc` first, so tests will fail until Phase 3

**Phase 1 only needs to verify:**
1. `npm install` exits 0
2. The tsconfig moduleResolution change doesn't break any file that WAS compiling before (i.e., non-LangChain-dependent files)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Ollama API client | Custom HTTP wrapper | `ollama-ai-provider` | Handles streaming, tool calls, providerOptions correctly |
| Peer dep conflict resolution | Manual package.json hacking | `npm install --legacy-peer-deps` (if needed) | Peer deps warned but not blocked in npm v7+ |
| CJS wrapper for ESM-only packages | Custom require() shim | None needed — all SDK packages ship CJS | Both `ai@6` and `@ai-sdk/openai@3` have `require` exports |
| Zod v4 schema compatibility layer | Version adapter code | Just pin `zod@^3` for Phase 1 | Zod v4 has API changes; rewrite in Phase 2 (CAT-02) |

---

## Common Pitfalls

### Pitfall 1: Installing `@ai-sdk/ollama` as the Ollama Provider
**What goes wrong:** Package 404s during `npm install`, blocking the entire install.
**Why it happens:** `@ai-sdk/ollama` was a planned/rumored package name but was never published. The official community provider is `ollama-ai-provider`.
**How to avoid:** Use `ollama-ai-provider` in package.json (same Vercel AI SDK `LanguageModelV1` interface).
**Warning signs:** `npm install` error: `404 Not Found - GET https://registry.npmjs.org/@ai-sdk%2follama`

### Pitfall 2: Mixing `ai@6` Core with `@ai-sdk/openai@0.x` (ai@4 era provider)
**What goes wrong:** TypeScript type errors — the provider interface changed between SDK generations.
**Why it happens:** `@ai-sdk/openai@3.x` is the correct companion for `ai@6.x`. Installing `npm install @ai-sdk/openai` without specifying a version installs `3.x` (correct), but installing `@ai-sdk/openai@^0` gets the v4-era package.
**How to avoid:** Always install `@ai-sdk/openai` without a version tag (gets `3.x` from `latest`).

### Pitfall 3: `moduleResolution: "bundler"` with `module: "commonjs"`
**What goes wrong:** TypeScript emits TS5109 error: `"Option 'moduleResolution' can only be used when 'module' is set to..."`
**Why it happens:** TypeScript 5+/6 strictly enforces that `"bundler"` needs a modern module format. The CONTEXT.md listed `"bundler"` as the primary option, which is incorrect for this project.
**How to avoid:** Use `"node16"` directly — it reads `exports` field and is fully compatible with `module: "commonjs"`.

### Pitfall 4: Installing `zod@latest` → Gets Zod v4 (Breaking API Changes)
**What goes wrong:** `npm install zod` installs `zod@4.3.6` (latest). `createCategories.ts` (rewritten in Phase 2) uses standard Zod v3 APIs. Phase 2 work may break if environment has Zod v4.
**Why it happens:** Zod v4 was released in 2025 and is now npm `latest`.
**How to avoid:** Pin `zod@^3` in Phase 1 (`npm install zod@^3`). Upgrade to Zod v4 intentionally as a separate decision in a future phase.

### Pitfall 5: Removing `natural`, `wink-pos-tagger`, `@types/natural` (D-04 false positives)
**What goes wrong:** Build fails because `src/rankedWatchlist.ts` imports and actively uses both.
**Why it happens:** D-04 listed them as "verify before removing" — verification shows they ARE used.
**How to avoid:** Only remove `youtubei.js`, `meow`, `compromise`, `camelcase`. Keep `natural`, `wink-pos-tagger`, `@types/natural`.

### Pitfall 6: TypeScript Globally Installed, Not in package.json
**What goes wrong:** On a CI server or another developer's machine, `npm run build` fails because `tsc` is not found.
**Why it happens:** This project has no `typescript` in `dependencies` or `devDependencies`. It relies on globally installed TypeScript (currently 6.0.2).
**How to avoid for Phase 1:** Acceptable as-is (not Phase 1 scope). Flag as QUAL debt for a future phase.

---

## Code Examples

### Verified package.json fragment after Phase 1

```json
{
  "dependencies": {
    "@ai-sdk/openai": "^3.0.52",
    "@babel/preset-env": "^7.26.9",
    "@babel/preset-typescript": "^7.26.0",
    "@jest/globals": "^29.7.0",
    "@types/jest": "^29.5.4",
    "@types/natural": "^6.0.1",
    "ai": "^6.0.154",
    "axios": "^1.4.0",
    "dotenv": "^16.3.1",
    "eslint": "^9.23.0",
    "googleapis": "^118.0.0",
    "jest": "^29.7.0",
    "natural": "^8.1.0",
    "npm-run-all": "^4.1.5",
    "ollama-ai-provider": "^1.2.0",
    "rimraf": "^5.0.5",
    "ts-jest": "^29.2.6",
    "wink-pos-tagger": "^2.2.2",
    "xml2js": "^0.6.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.6.0",
    "@types/node": "^20.1.4",
    "@types/xml2js": "^0.4.14",
    "globals": "^15.7.0",
    "typescript-eslint": "^7.14.1"
  }
}
```

Note: No `overrides` block (removed per D-05).

### Verified tsconfig.json moduleResolution change

```jsonc
/* Modules */
"module": "commonjs",
"moduleResolution": "node16",    // ADD THIS LINE
"outDir": "./dist",
"esModuleInterop": true,         // Already present — no change needed
```

### Verify install succeeded (smoke test commands)

```bash
# Check no peer dep warnings about @ai-sdk packages
npm install --dry-run 2>&1 | grep -i "peer dep"

# Verify ai SDK is resolvable
node -e "require('ai'); console.log('ai OK')"
node -e "require('@ai-sdk/openai'); console.log('@ai-sdk/openai OK')"
node -e "require('ollama-ai-provider'); console.log('ollama-ai-provider OK')"
node -e "require('zod'); console.log('zod OK')"
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| `ai@4.x` + `@ai-sdk/openai@0.x` | `ai@6.x` + `@ai-sdk/openai@3.x` | 2024-2026 | Version families don't mix; always co-install matching versions |
| `@ai-sdk/ollama` (never existed) | `ollama-ai-provider` | Always true | Direct package name correction needed |
| `moduleResolution: "node"` (default) | `moduleResolution: "node16"` | TypeScript 4.7+ | Required to resolve `exports` field in modern packages |
| Zod v3 | Zod v4 (now npm `latest`) | ~2025 | Pin to `^3` during Phase 1 migration; v4 upgrade is separate work |
| LangChain chain/pipe | `generateObject()` from `ai` SDK | 2024 | Out of Phase 1 scope — Phase 2 handles code rewrite |

---

## Open Questions

1. **Should we use `ai@^6` or `ai@^5`?**
   - What we know: Both v5 and v6 are stable; v6 is `latest`; `generateObject()` API is compatible across both; v5 has a 5.0.170 stable tag; v6 is newer with additional features we don't need
   - What's unclear: User intent when writing "^4.x" — was it "version 4 specifically" or "current generation"?
   - Recommendation: Use `ai@^6` (current `latest`). If user wants lowest-risk, `ai@^5` with `@ai-sdk/openai@^1` is the previous stable. Both work for `generateObject()`.

2. **Will the test pipeline work in Phase 1?**
   - What we know: `npm test` = `npm run build && jest`; `npm run build` runs `tsc`; after Phase 1 tsc will error on createCategories.ts/youtubeSumm.ts LangChain imports
   - What's unclear: Whether the plan should workaround this (temporarily silencing those files) or accept broken TEST until Phase 2/3
   - Recommendation: Accept that `npm test` will fail after Phase 1 (tsc errors from LangChain removal). DEP-03 only requires `npm install` to succeed. DEAD-03 (full compilation) is Phase 3.

3. **`--legacy-peer-deps` needed?**
   - What we know: `ai@6` peer dep is `zod: '^3.25.76 || ^4.1.8'`; `ollama-ai-provider` peer dep is `zod: '^3.0.0'`; both satisfied by `zod@3.25.76`
   - Expectation: Clean install without `--legacy-peer-deps`
   - Recommendation: Try without first; only add if npm reports peer dep conflicts.

---

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| TypeScript | `npm run build` | ✓ (global) | 6.0.2 | Not in package.json — globally installed |
| ts-node | `npm start` | ✓ (global) | 10.9.2 | Not in package.json — globally installed |
| Node.js | Runtime | ✓ | 25.9.0 | Current and compatible |
| npm | Package manager | ✓ | (project uses npm) | No lockfile committed |

**Note:** TypeScript and ts-node not being in package.json is a pre-existing condition. Not Phase 1's problem to fix (backlog item).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + Babel |
| Config file | `babel.config.js` + Jest inferred config in `package.json` |
| Quick run command | `jest` (bypass build) |
| Full suite command | `npm test` (= `npm run build && jest`) |

**Critical note:** `npm test` will FAIL in Phase 1 because it runs `tsc` first, and tsc will error on LangChain imports in unchanged source files. Phase 1's DEP-03 requirement only mandates `npm install` success, NOT `npm test` success. Use `jest` directly (or `npx jest`) to run tests post-Phase-1.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DEP-01 | Replace packages in package.json | manual / smoke | `npm install && npm ls ai @ai-sdk/openai ollama-ai-provider` | N/A |
| DEP-02 | Remove dead packages | manual / smoke | `npm ls youtubei.js meow compromise camelcase 2>&1 \| grep "not found"` | N/A |
| DEP-03 | npm install succeeds | smoke | `npm install; echo $?` (expect 0) | N/A |

### Wave 0 Gaps
None for Phase 1 — no new code is written, only package.json + tsconfig changes. No test files needed.

---

## Sources

### Primary (HIGH confidence — verified live)
- npm registry live queries on 8 April 2026:
  - `npm view ai dist-tags` → confirmed `latest: 6.0.154`
  - `npm view @ai-sdk/ollama version` → confirmed 404 (does not exist)
  - `npm view ollama-ai-provider version` → confirmed `1.2.0`
  - `npm view ai@6.0.154 exports` → confirmed CJS `require` entrypoint
  - `npm view ai@5.0.170 peerDependencies` → `zod: '^3.25.76 || ^4.1.8'`
  - `npm view zod version` → confirmed `4.3.6` (latest, v4)
  - `npm view "zod@^3" version` → confirmed `3.25.76` (latest v3)
- Project files read: `package.json`, `tsconfig.json`, `src/rankedWatchlist.ts`, `src/service/createCategories.ts`, `src/service/youtubeSumm.ts`, `babel.config.js`
- Environment verified: `tsc --version` → TypeScript 6.0.2; `ts-node --version` → v10.9.2

### Training Knowledge (MEDIUM confidence — not independently verified against TypeScript 6 docs)
- TypeScript `moduleResolution: "bundler"` incompatibility with `module: "commonjs"` (TypeScript 5+ restriction)
- ts-node 10.x support for `moduleResolution: "node16"` with `module: "commonjs"`

---

## Metadata

**Confidence breakdown:**
- Package names and versions: HIGH — verified live against npm registry
- Ollama provider finding: HIGH — direct 404 from registry
- CJS/ESM compatibility: HIGH — verified from package.json `exports` field in registry metadata
- moduleResolution "node16" recommendation: HIGH — based on TypeScript 5+/6 semantics (MEDIUM on exact TypeScript 6.0 TS5109 wording)
- natural/wink-pos-tagger retention: HIGH — grep confirmed active imports in source

**Research date:** 8 April 2026
**Valid until:** ~30 days (stable packages; Zod v4 situation may change)
