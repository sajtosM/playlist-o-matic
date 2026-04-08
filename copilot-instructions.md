<!-- GSD:project-start source:PROJECT.md -->
## Project

**playlist-o-matic**

A CLI tool that reads a YouTube watchlist export, uses an LLM to categorize videos into user-defined topic buckets, and pushes organized playlists back to YouTube via the Data API v3. It supports both OpenAI (GPT-4o-mini) and local Ollama models as AI backends.

**Core Value:** Accurate, structured LLM-driven categorization of YouTube watchlist videos — using Vercel AI SDK `generateObject()` for reliable structured output across both OpenAI and Ollama.

### Constraints

- **Tech Stack**: Must use Vercel AI SDK (`ai` ^4.x, `@ai-sdk/openai`, `@ai-sdk/ollama`) — no other AI framework
- **Schema**: Existing Zod classification schema must be preserved exactly (category enum, reason, optional rating)
- **Compatibility**: TypeScript + CommonJS module system must continue to work with `ts-node`
- **Secrets**: API keys remain in `.env` — no changes to secret handling
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- **TypeScript** — Primary language for all source code
- **JavaScript** — Babel config, data merge script (`data/mergeLiked.js`)
- **Shell (Bash)** — Utility scripts (`render.sh`, `src/getCategoryList.sh`)
## Runtime
- **Node.js** — Target: ES2021, module system: CommonJS
- **ts-node** — Used for direct TypeScript execution (`npm start` → `ts-node src/index.ts`)
## Build Toolchain
- **TypeScript Compiler (tsc)** — Compiles to `dist/` directory
- **Babel** — `@babel/preset-env` + `@babel/preset-typescript` (used by Jest for test transpilation)
- **rimraf** — Clean build output (`dist/*`)
- **npm-run-all** — Script orchestration (clean → tsc)
## Package Manager
- **npm** — Standard npm with `package.json` (no lockfile committed)
## Key Dependencies
### AI / LLM
| Package | Version | Purpose |
|---------|---------|---------|
| `langchain` | ^0.3.19 | LLM orchestration framework |
| `@langchain/core` | ^0.3.7 | Core LangChain abstractions (prompts, chains) |
| `@langchain/openai` | ^0.5.2 | OpenAI integration (GPT-4o-mini for categorization) |
| `@langchain/ollama` | ^0.2.0 | Ollama local LLM integration |
| `zod` | (transitive) | Schema validation for structured LLM output |
### YouTube / Google APIs
| Package | Version | Purpose |
|---------|---------|---------|
| `googleapis` | ^118.0.0 | YouTube Data API v3 (playlist CRUD, video management) |
| `youtubei.js` | ^8.0.0 | YouTube innertube API (listed but not observed in use) |
| `axios` | ^1.4.0 | HTTP client (YouTube RSS feed fetching) |
| `xml2js` | ^0.6.2 | XML parsing (YouTube RSS/Atom feeds) |
### NLP / Text Processing
| Package | Version | Purpose |
|---------|---------|---------|
| `natural` | ^8.1.0 | Jaro-Winkler distance, TF-IDF for title similarity scoring |
| `wink-pos-tagger` | ^2.2.2 | POS tagging for noun/verb extraction |
| `compromise` | ^14.14.4 | NLP library (listed but not observed in main code) |
### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| `dotenv` | ^16.3.1 | Environment variable loading from `.env` |
| `meow` | ^13.2.0 | CLI argument parsing (listed but not observed in use) |
| `camelcase` | ^7.0.1 | String utility (listed but not observed in use) |
## Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^29.7.0 | Test framework |
| `ts-jest` | ^29.2.6 | Jest TypeScript transformer |
| `@types/jest` | ^29.5.4 | Jest type definitions |
| `@types/node` | ^20.1.4 | Node.js type definitions |
| `@types/xml2js` | ^0.4.14 | xml2js type definitions |
| `@types/natural` | ^6.0.1 | natural library type definitions |
| `eslint` | ^9.23.0 | Linter |
| `@eslint/js` | ^9.6.0 | ESLint JS config |
| `typescript-eslint` | ^7.14.1 | TypeScript ESLint integration |
| `globals` | ^15.7.0 | Global variable definitions for ESLint |
## Configuration Files
- `tsconfig.json` — TypeScript config (target: ES2021, module: CommonJS)
- `babel.config.js` — Babel presets for Jest
- `package.json` — Project metadata, scripts, dependencies
- `.env` — Runtime secrets (not committed): API keys, OAuth tokens
## NPM Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| `start` | `ts-node src/index.ts` | Run main entry point |
| `build` | `npm-run-all clean tsc` | Clean + compile |
| `clean` | `rimraf dist/*` | Remove build output |
| `tsc` | `tsc` | TypeScript compilation |
| `test` | `npm run build && jest` | Build then run tests |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
### General
- **No strict linter enforcement observed** — ESLint is installed but no `.eslintrc` config file found (uses flat config via `eslint.config.js` or defaults)
- **Semicolons:** Used consistently
- **Quotes:** Double quotes in imports and strings (some inconsistency — single quotes in `getRefreshToken.ts`)
- **Indentation:** 4 spaces in most files (some files use 2 spaces)
- **Trailing commas:** Inconsistent
### Imports
- Named imports preferred: `import { readFileSync, writeFileSync } from "fs"`
- Star imports for namespaced modules: `import * as dotenv from "dotenv"`
- Default imports for specific libraries: `import natural from 'natural'`
- `dotenv.config()` called in multiple files independently (no centralized init)
### Function Style
- Mix of `async function` declarations and `const fn = async () => {}` arrow function exports
- Both patterns used interchangeably within the same file
- Functions are generally long — single-function files that do everything inline
### Type Definitions
- Inline types with `type` keyword (no interfaces observed)
- Zod schemas used for runtime validation of LLM output
- `any` type used extensively for YouTube API responses and dynamic data
### Error Handling
- Try/catch blocks around API calls with `console.error` logging
- Errors generally re-thrown after logging
- `process.exit(1)` for fatal CLI argument errors
- No custom error classes
## Patterns
### LLM Integration Pattern
### YouTube API Pattern
### File I/O Pattern
### Incremental Processing Pattern
- `createCategories.ts` checks `data/watchlistCategory.json` for already-categorized videos
- Skips re-processing by matching video IDs
- Appends new results to existing data
### Rate Limiting Pattern
- Manual `setTimeout` delays between API calls: 200ms between video additions, 5s between playlists
- No retry logic or exponential backoff
## Naming Conventions
- **Functions:** camelCase (`createCategories`, `addChannelList`, `renderCategories`)
- **Types:** PascalCase (`SavedChannel`, `Video`)
- **Files:** camelCase (`createCategories.ts`, `playListManagement.ts`)
- **Environment variables:** SCREAMING_SNAKE (`OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`)
- **CLI flags:** kebab-case with `--` prefix (`--ollama`, `--render`, `--youtubePlaylist`)
## Environment Variable Usage
- `dotenv.config()` called independently in multiple modules
- Required variables validated with explicit checks and `throw new Error()` in `playListManagement.ts`
- No centralized env validation module
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern
## High-Level Data Flow
```
```
### Secondary Pipeline (Ranked Watchlist)
```
```
## Entry Points
| Entry Point | Invocation | Purpose |
|-------------|-----------|---------|
| `src/index.ts` | `ts-node src/index.ts <categoryList> <watchlist> [--ollama] [--render] [--youtubePlaylist]` | Main categorization + playlist creation |
| `src/rankedWatchlist.ts` | Direct execution | Rank watchlist by liked video similarity |
| `src/service/writeCatFile.ts` | Direct execution | Standalone markdown renderer |
| `src/service/getRefreshToken.ts` | Direct execution | OAuth2 token setup |
## Layers
### 1. CLI / Entry Layer
- `src/index.ts` — Argument parsing, mode selection (categorize vs render), orchestration
- `src/rankedWatchlist.ts` — Independent ranked watchlist workflow
### 2. Service Layer (`src/service/`)
- `createCategories.ts` — AI-powered video categorization (OpenAI/Ollama via LangChain)
- `createPlaylists.ts` — Orchestrates YouTube playlist creation per category
- `playListManagement.ts` — YouTube API wrapper (CRUD for playlists and playlist items)
- `renderCategories.ts` — Markdown file generation from categorized data
- `channelList.ts` — Channel extraction and CSV management
- `processPlaylist.ts` — RSS feed processing + summarization (experimental)
- `youtubeSumm.ts` — Video summarization via LLM (experimental, partially broken)
- `getRefreshToken.ts` — OAuth2 refresh token acquisition flow
- `writeCatFile.ts` — Standalone category file writer
### 3. Data Layer
- Local filesystem (`data/` directory) — JSON, CSV, Markdown, TXT files
- No database — all persistence is file-based
## Key Abstractions
- **LangChain chains** — `ChatPromptTemplate.pipe(llmWithStructuredOutput)` pattern for AI categorization
- **Zod schemas** — Structured output validation for LLM responses
- **OAuth2Client** — Google auth abstraction wrapping token refresh
- **SavedChannel type** — Channel-to-category mapping model
## Module Dependencies
```
```
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
