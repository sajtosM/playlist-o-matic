# Concerns

## Technical Debt

### High Priority

**1. Unused / Dead Dependencies**
- `youtubei.js` (^8.0.0) — listed in `package.json` but no imports observed in source code
- `meow` (^13.2.0) — CLI parser listed but not used (manual `process.argv` parsing instead)
- `compromise` (^14.14.4) — NLP library listed but not imported anywhere
- `camelcase` (^7.0.1) — listed but not observed in use
- These inflate install size and attack surface unnecessarily

**2. Broken/Incomplete Features**
- `src/service/youtubeSumm.ts` — YouTube loader is commented out with `FIXME: youtube loader is deprecated`. The `getYoutubeInfo()` function always returns `null`, making `getYoutubeSummary()` always return "Youtube video could not be loaded."
- `src/service/processPlaylist.ts` — Depends on `getYoutubeSummary()` which is broken. Contains `debugger` statements left in production code
- `getWatchLaterPlaylistId()` and `getWatchLaterVideos()` in `playListManagement.ts` — marked as not working ("🛑 Not working" / "Google does not want us to access this")

**3. Pervasive `any` Types**
- YouTube API responses typed as `any` throughout
- `watchlist: any` parameter in `createPlaylistsForCategories()` and `renderCategories()`
- Reduces TypeScript's ability to catch bugs at compile time

### Medium Priority

**4. Duplicated `dotenv.config()` Calls**
- Called independently in: `index.ts`, `createCategories.ts`, `playListManagement.ts`, `youtubeSumm.ts`, `getRefreshToken.ts`
- Should be centralized at entry points only

**5. No Argument Parsing Library**
- `src/index.ts` uses raw `process.argv` with positional index access
- Fragile: `process.argv[3]` could be either a category ID or a flag depending on context
- `meow` is already installed but unused

**6. Hardcoded File Paths**
- `data/watchlistCategory.json` hardcoded in `createCategories.ts`
- `data/wl.json` hardcoded in `channelList.ts` (lowercase — potential case sensitivity issue on Linux)
- `data/channelList.csv` hardcoded in `channelList.ts`
- Makes the tool inflexible and fragile

**7. `renderCategories()` Bug**
- The `fileName` parameter is overwritten to `"watchlistCategory.md"` when it's truthy — the condition should be `if (!fileName)` but is `if (fileName)`. This means the passed filename is always ignored.

## Security Concerns

**1. No Input Sanitization on Browser Export**
- `data/WL.json` is parsed directly from user-pasted browser console output
- Video titles could contain malicious content that gets passed to LLM prompts (prompt injection risk)
- Markdown output includes raw video titles — XSS risk if rendered in a web context

**2. OAuth Token in `.env`**
- Refresh token stored in plain text `.env` file
- `getRefreshToken.ts` writes token directly to `.env` file
- No encryption or secure credential storage

**3. Unvalidated XML from YouTube RSS**
- `processPlaylist.ts` fetches and parses XML from YouTube RSS feeds via `xml2js`
- No XML validation or sanitization

## Performance Concerns

**1. Sequential AI Processing**
- `createCategories.ts` processes videos one by one in a for loop
- No batching or parallel processing of LLM calls
- Large watchlists (100+ videos) will be slow

**2. Rate Limiting Strategy**
- Fixed `setTimeout` delays (200ms, 5s) rather than adaptive rate limiting
- No retry logic for API quota errors
- No exponential backoff

**3. Full File Rewrites**
- `watchlistCategory.json` is rewritten entirely on each run
- Channel list CSV is read/written entirely for each update

## Fragile Areas

**1. `src/index.ts` Argument Parsing**
- Positional argument handling is brittle: argument meaning changes based on presence of `--render` flag
- `process.argv[3]` can be a category filter or the start of flags

**2. Video ID Cleaning**
- `video.id.split('&')[0]` used in multiple places to strip URL parameters
- Assumes specific URL format from browser export

**3. CSV Parsing in `channelList.ts`**
- Manual semicolon-split parsing with no CSV library
- No handling of escaped semicolons or quoted fields
- Header removal via `.shift()` is destructive

**4. Unreachable Code**
- `processPlaylist.ts` has `debugger` statements and code after `return` (dead code)
- `channelList.ts` has a commented-out function call at file end

## Missing Features
- No logging framework (just `console.log`/`console.error`)
- No configuration management beyond `.env`
- No CLI help/usage output
- No progress indicators for long-running operations
- No dry-run mode for YouTube API operations
