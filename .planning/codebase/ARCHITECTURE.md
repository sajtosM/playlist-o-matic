# Architecture

## Pattern
**CLI-driven batch processing pipeline** — No server, no UI. The application is a command-line tool that processes YouTube watchlist data through an AI categorization pipeline and outputs organized playlists.

## High-Level Data Flow

```
User Input (Browser Export)
    ↓
data/WL.json (raw watchlist)
    ↓
src/index.ts (CLI entry point)
    ├── Mode 1: Categorize → createCategories() → AI inference → data/watchlistCategory.json
    │       ↓
    │   renderCategories() → data/watchlistCategory.md
    │       ↓
    │   createPlaylistsForCategories() → YouTube API → playlists created
    │
    └── Mode 2: Render only → read categorized JSON → renderCategories() + optional YouTube push
```

### Secondary Pipeline (Ranked Watchlist)
```
data/WL.json + data/liked_merged.json
    ↓
src/rankedWatchlist.ts
    ↓
NLP similarity scoring (Jaro-Winkler + keyword + noun/verb overlap)
    ↓
data/WL_ranked.json
    ↓
createTop30Playlist() → YouTube API
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
index.ts
  ├── createCategories (service)
  │     ├── channelList (service)
  │     └── LangChain (OpenAI / Ollama)
  ├── renderCategories (service)
  ├── createPlaylists (service)
  │     ├── playListManagement (service)
  │     └── renderCategories (service)
  └── playListManagement (service)
        └── getRefreshToken (service)

rankedWatchlist.ts
  ├── natural (NLP)
  ├── wink-pos-tagger (NLP)
  └── playListManagement (service)
```
