# Playlist-o-matic

A tool for automatically categorizing YouTube videos from your watchlist into playlists using AI.

## Features

- Automatically categorizes YouTube videos based on  content
- Creates organized playlists from your watchlist
- Renders playlists as markdown files for easy viewing
- Create YouTube playlists with the categorized videos
- *(In development)* Video summarization using subtitle content

## Installation

```sh
git clone https://github.com/sajtosM/playlist-o-matic.git
cd playlist-o-matic
npm install
```

Create a `.env` file with your OpenAI API key and YouTube API credentials:

```sh
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
REDIRECT_URI="http://localhost:3000/auth/google/callback"
YOUTUBE_PLAYLIST_PREFIX="[Prefix] " # Optional: Adds a prefix to all created playlist names
```

Alternatively, you can use [Ollama](https://ollama.ai/) for local AI inference by installing it on your machine and adding the `--ollama` flag when running the tool.

## How to Use

### 1. Export Your YouTube Watchlist

While on your YouTube watchlist page, run this JavaScript in your browser console:

```js
console.log(
    JSON.stringify(
        Array.from(document.querySelectorAll('#contents ytd-playlist-video-renderer'))
            .map(video => {
                try {
                    const title = video.querySelector('#video-title').textContent.trim();
                    const link = video.querySelector('#video-title').href;
                    const channelName = video.querySelector('#channel-name').querySelector('.yt-formatted-string').textContent.trim();
                    const numberOfView = video.querySelector('#video-info').querySelectorAll('.style-scope')[0].textContent.trim();
                    const whenWasItPosted = video.querySelector('#video-info').querySelectorAll('.style-scope')[2].textContent.trim();
                    const id = link.split('v=')[1];
                    return { title, link, id, channelName, numberOfView, whenWasItPosted };
                } catch (error) {

                }
            })
            .filter(video => video)
    )
);
```

Save the output as `data/WL.json`.

### 2. Define Categories

Create a file named `data/categoryList.txt` with your desired categories:

```
🎮Gaming
🎵Music
🎨Art
📚Education
```

### 3. Generate Categorized Playlists

```sh
# Basic categorization
ts-node src/index.ts data/categoryList.txt data/WL.json

# Use Ollama instead of OpenAI for local inference
ts-node src/index.ts data/categoryList.txt data/WL.json --ollama

# Create actual YouTube playlists with the categorized videos
ts-node src/index.ts data/categoryList.txt data/WL.json --youtubePlaylist

# Combine flags as needed
ts-node src/index.ts data/categoryList.txt data/WL.json --ollama --youtubePlaylist
```

### 4. Render Existing Categorized Lists

If you already have a categorized list JSON file, you can render it to markdown without re-categorizing:

```sh
ts-node src/index.ts data/watchlistCategory.json --render
```

### 5. YouTube Authentication

To use the YouTube API for creating playlists, you'll need to authenticate:

```sh
# Generate a refresh token for YouTube API
node -e "require('./dist/service/getRefreshToken').getYouTubeRefreshToken()"
```

This will guide you through the authentication process and save the refresh token to your .env file.

## Command-line Flags

- `--ollama`: Use Ollama instead of OpenAI for AI inference
- `--render`: Render an existing categorized list JSON to markdown
- `--youtubePlaylist`: Create actual YouTube playlists for each category

## Known Issues

- Video content analysis using subtitles is currently not functioning
- Limited to title-based categorization at the moment

## License

See the [LICENSE](LICENSE) file for details.
