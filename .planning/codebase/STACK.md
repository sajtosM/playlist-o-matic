# Stack

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
