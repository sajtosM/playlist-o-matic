# Structure

## Directory Layout

```
playlist-o-matic/
├── src/                          # Source code
│   ├── index.ts                  # Main CLI entry point
│   ├── rankedWatchlist.ts        # Watchlist ranking by liked video similarity
│   ├── getCategoryList.sh        # Shell script to extract categories from Obsidian vault
│   ├── service/                  # Service modules
│   │   ├── channelList.ts        # Channel extraction & CSV management
│   │   ├── createCategories.ts   # AI-powered video categorization (LangChain)
│   │   ├── createPlaylists.ts    # YouTube playlist creation orchestrator
│   │   ├── getRefreshToken.ts    # OAuth2 refresh token acquisition
│   │   ├── playListManagement.ts # YouTube API wrapper (playlist CRUD)
│   │   ├── processPlaylist.ts    # RSS feed processing & summarization
│   │   ├── renderCategories.ts   # Markdown output generation
│   │   ├── writeCatFile.ts       # Standalone category file writer
│   │   └── youtubeSumm.ts        # Video summarization via LLM
│   └── test/                     # Test files
│       └── createPlayList.test.ts # Integration test for playlist creation
├── data/                         # Data files (input/output)
│   ├── WL.json                   # Raw YouTube watchlist export
│   ├── watchlistCategory.json    # AI-categorized watchlist output
│   ├── watchlistCategory.md      # Rendered category markdown
│   ├── channelList.csv           # Channel → category CSV mapping
│   ├── categories.txt            # Raw category list from Obsidian
│   ├── categoriesFiltered.txt    # Filtered categories for AI prompt
│   ├── WL_ranked.json            # Ranked watchlist output
│   ├── liked.json                # Liked videos export
│   ├── liked2.json               # Additional liked videos
│   ├── liked_merged.json         # Merged liked video data
│   ├── mergeLiked.js             # Script to merge liked video files
│   ├── categoryList.md           # Category listing
│   ├── casyList.md               # Additional watchlist data (markdown)
│   └── casyWL.json               # Additional watchlist data (JSON)
├── babel.config.js               # Babel config for Jest
├── package.json                  # Project metadata & dependencies
├── tsconfig.json                 # TypeScript configuration
├── render.sh                     # Batch rendering script for multiple categories
├── README.md                     # Project documentation
├── LICENSE                       # MIT license
└── youtubePlaylist.md            # YouTube playlist notes/output
```

## Key Locations

| What | Where |
|------|-------|
| Entry point | `src/index.ts` |
| Service modules | `src/service/` |
| Tests | `src/test/` |
| Data input/output | `data/` |
| Build output | `dist/` (gitignored) |
| Environment config | `.env` (not committed) |

## Naming Conventions

### Files
- **TypeScript source:** camelCase (`createCategories.ts`, `playListManagement.ts`)
- **Test files:** `*.test.ts` pattern (`createPlayList.test.ts`)
- **Data files:** camelCase or SCREAMING_SNAKE for abbreviations (`WL.json`, `watchlistCategory.json`)
- **Shell scripts:** camelCase (`getCategoryList.sh`, `render.sh`)

### Code
- **Functions:** camelCase (`createCategories`, `renderCategories`, `addChannelList`)
- **Types:** PascalCase (`SavedChannel`, `Video`)
- **Constants:** camelCase (no SCREAMING_SNAKE convention observed)
- **Exports:** Named exports throughout (no default exports)

## File Responsibilities

| File | Lines (approx) | Primary Responsibility |
|------|----------------|----------------------|
| `src/index.ts` | ~60 | CLI argument parsing, workflow orchestration |
| `src/service/createCategories.ts` | ~190 | AI categorization pipeline with LangChain |
| `src/service/playListManagement.ts` | ~250 | YouTube API wrapper (all playlist operations) |
| `src/service/createPlaylists.ts` | ~45 | Playlist creation orchestrator per category |
| `src/service/renderCategories.ts` | ~40 | Markdown table generation |
| `src/service/channelList.ts` | ~70 | Channel extraction and CSV read/write |
| `src/service/youtubeSumm.ts` | ~100 | Video summarization (experimental) |
| `src/service/processPlaylist.ts` | ~60 | RSS feed fetch + summarization |
| `src/service/getRefreshToken.ts` | ~100 | OAuth2 flow with local HTTP server |
| `src/rankedWatchlist.ts` | ~170 | NLP-based watchlist ranking |
