# Integrations

## External APIs

### YouTube Data API v3 (Primary)
- **Library:** `googleapis` (v118)
- **Auth:** OAuth2 with refresh token (Google Cloud Console credentials)
- **Operations:**
  - Create playlists (`youtube.playlists.insert`) — `src/service/playListManagement.ts`
  - List user playlists (`youtube.playlists.list`) — `src/service/playListManagement.ts`
  - Add videos to playlists (`youtube.playlistItems.insert`) — `src/service/playListManagement.ts`
  - Remove videos from playlists (`youtube.playlistItems.delete`) — `src/service/playListManagement.ts`
  - List Watch Later videos (`youtube.playlistItems.list`) — `src/service/playListManagement.ts`
- **Rate limiting:** Manual 200ms delay between video additions, 5s delay between playlist creations
- **Privacy:** Playlists created as `private` by default
- **Known issue:** Watch Later playlist access doesn't work (Google API limitation) — see comment in `getWatchLaterPlaylistId()`

### YouTube RSS/Atom Feed
- **Library:** `axios` + `xml2js`
- **URL pattern:** `https://www.youtube.com/feeds/videos.xml?playlist_id={id}`
- **Used in:** `src/service/processPlaylist.ts` — `getPlaylistItems()`
- **Purpose:** Fetch playlist contents via public RSS (no auth needed)

### OpenAI API
- **Library:** `@langchain/openai` → `ChatOpenAI`
- **Model:** `gpt-4o-mini`
- **Used in:** `src/service/createCategories.ts` — video categorization with structured output
- **Auth:** `OPENAI_API_KEY` environment variable
- **Pattern:** LangChain structured output with Zod schema validation

### Ollama (Local LLM)
- **Library:** `@langchain/ollama` → `ChatOllama`
- **Model:** Configurable via `OLLAMA_MODEL` env var (default: `phi4`)
- **Used in:** `src/service/createCategories.ts` (alternative to OpenAI), `src/service/youtubeSumm.ts`
- **Activation:** `--ollama` CLI flag
- **Temperature:** 0 for categorization, 0.1 for summarization

## Authentication

### Google OAuth2
- **Flow:** Authorization code flow with local HTTP callback server
- **Implementation:** `src/service/getRefreshToken.ts`
- **Scopes:** `https://www.googleapis.com/auth/youtube`
- **Credentials stored in `.env`:**
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `REDIRECT_URI` (default: `http://localhost:3000/auth/google/callback`)
  - `REFRESH_TOKEN` (obtained via OAuth flow, auto-saved to `.env`)
- **Token refresh:** Handled automatically by `googleapis` OAuth2Client

## Data Sources (User-Provided)

### Browser Console Export
- **Source:** YouTube watchlist page → browser developer console
- **Format:** JSON array of video objects
- **Fields:** `title`, `link`, `id`, `channelName`, `numberOfView`, `whenWasItPosted`
- **Output file:** `data/WL.json`

### Obsidian Vault (Category Source)
- **Source:** `src/getCategoryList.sh` reads Obsidian vault directory structure
- **Path:** `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Vault`
- **Pattern:** Extracts folder names from `01 - Projects/`, `02 - Areas/`, `03 - Resources/`
- **Output:** `data/categories.txt` → filtered into `data/categoriesFiltered.txt`

## Data Storage (Local Files)

| File | Format | Purpose |
|------|--------|---------|
| `data/WL.json` | JSON | Raw watchlist export from YouTube |
| `data/watchlistCategory.json` | JSON | Categorized watchlist (AI output) |
| `data/watchlistCategory.md` | Markdown | Rendered category tables |
| `data/channelList.csv` | CSV | Channel → category mapping (semicolon-delimited) |
| `data/categoriesFiltered.txt` | Text | Filtered category names (one per line) |
| `data/WL_ranked.json` | JSON | Watchlist ranked by similarity to liked videos |
| `data/liked.json` / `data/liked2.json` / `data/liked_merged.json` | JSON | Liked video data for ranking |
| `data/casyList.md` / `data/casyWL.json` | Various | Additional watchlist data |

## Databases
- **None** — All data persisted as local JSON/CSV/Markdown files

## Webhooks / Event Handlers
- **OAuth callback server** — Temporary HTTP server on port extracted from `REDIRECT_URI` for OAuth2 token exchange (`src/service/getRefreshToken.ts`)
