# Conventions

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
```typescript
// 1. Define Zod schema for structured output
const schema = z.object({ category: z.enum([...]), reason: z.string() });
// 2. Create LLM instance (OpenAI or Ollama based on flag)
const llm = isOllama ? new ChatOllama({...}) : new ChatOpenAI({...});
// 3. Attach structured output
const llmStructured = llm.withStructuredOutput(schema);
// 4. Create chain: prompt template → structured LLM
const chain = prompt.pipe(llmStructured);
// 5. Invoke per item
const result = await chain.invoke({ input });
```

### YouTube API Pattern
```typescript
// OAuth2 client initialized at module level
const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
// Operations use youtube.playlists.* or youtube.playlistItems.*
```

### File I/O Pattern
```typescript
// Read JSON
const data = JSON.parse(readFileSync(path, "utf-8"));
// Write JSON
writeFileSync(path, JSON.stringify(data, null, 2));
// Read CSV with manual parsing
const csv = readFileSync(path, 'utf8').split('\n').map(row => row.split(';'));
```

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
