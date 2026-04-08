# Testing

## Framework
- **Jest** (v29.7.0) with **ts-jest** for TypeScript support
- **Babel** used as transformer (`@babel/preset-env` + `@babel/preset-typescript`)
- Configuration via `babel.config.js` (no explicit `jest.config.js` found — likely uses `package.json` defaults)

## Test Structure
- Tests located in `src/test/` directory
- Single test file: `src/test/createPlayList.test.ts`
- File naming: `*.test.ts` pattern

## Test Coverage
- **Minimal** — only 1 test file exists covering playlist creation
- No unit tests for core logic (categorization, rendering, ranking, channel list management)
- No mocks for external APIs (YouTube, OpenAI/Ollama)

## Existing Test

### `src/test/createPlayList.test.ts`
```typescript
describe("createPlaylist", () => {
    it("should create a playlist", async () => {
        const playlistId = await createPlaylist("Test Playlist", "This is a test playlist", "private");
        console.log("Created playlist with ID:", playlistId);
    });
});
```
- **Type:** Integration test (hits real YouTube API)
- **Timeout:** 5 minutes (`jest.setTimeout(5 * 60000)`)
- **No assertions** — only logs the playlist ID, no `expect()` calls
- **Side effects:** Creates a real playlist on the user's YouTube account
- **No cleanup:** Created playlist is not deleted after test

## Test Execution
- `npm test` → builds first (`npm run build`), then runs Jest
- No CI/CD pipeline observed
- No test coverage reporting configured

## Mocking
- No mocking infrastructure in place
- No mock files or `__mocks__/` directories
- External API calls (YouTube, LLMs) are not mocked in tests

## Areas Without Test Coverage
- `createCategories.ts` — AI categorization pipeline
- `renderCategories.ts` — Markdown generation
- `channelList.ts` — CSV channel management
- `rankedWatchlist.ts` — NLP similarity scoring
- `processPlaylist.ts` — RSS feed processing
- `playListManagement.ts` — YouTube API operations (except one integration test)
- `getRefreshToken.ts` — OAuth flow
- `index.ts` — CLI argument parsing and orchestration
