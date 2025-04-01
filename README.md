# Playlist-o-matic

A tool for automatically categorizing YouTube videos from your watchlist into playlists using AI.

## Features

- Automatically categorizes YouTube videos based on title content
- Creates organized playlists from your watchlist
- Renders playlists as markdown files for easy viewing
- *(In development)* Video summarization using subtitle content

## Installation

```sh
git clone https://github.com/sajtosM/playlist-o-matic.git
cd playlist-o-matic
npm install
```

Create a `.env` file with your OpenAI API key:

```sh
OPENAI_API_KEY="your-openai-api-key"
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
ts-node src/index.ts data/categoryList.txt data/WL.json
# or
npm start src/index.ts data/categoryList.txt data/WL.json
```

You can also use Ollama models instead of OpenAI for categorization by adding the `--ollama` flag:

```sh
ts-node src/index.ts data/categoryList.txt data/WL.json --ollama
```

This requires having Ollama installed and the phi4 model available locally.

### 4. Render Playlists as Markdown

```sh
ts-node src/writeCatFile.ts "data/watchlistCategory.json"
```

## Known Issues

- Video content analysis using subtitles is currently not functioning
- Limited to title-based categorization at the moment

## License

See the [LICENSE](LICENSE) file for details.
