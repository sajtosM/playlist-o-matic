# Playlist-o-matic

Playlist-o-matic is a tool designed to automate the creation and categorization of YouTube playlists. It uses AI models to summarize YouTube videos and categorize them based on their content.

## Features

- Categorizes videos and creates playlists based on their content (content getter not working ATM) and title.
- Renders the playlist as markdown files for easy reading.
- (BROKEN) Uses the subtitle of the video to summarize the videos and use that as a basis for categorization.

## Installation

To install the project, you need to have Node.js installed on your machine. Then, you can clone the repository and install the dependencies:

```sh
git clone https://github.com/sajtosM/playlist-o-matic.git
cd playlist-o-matic
npm install
```

Create a dotenv file in the project directory with the following content:

```sh
OPENAI_API_KEY="<openai-api-key>"
```

## Usage

Download your watchlist by executing the following command in your browser while on the YouTube watchlist page:

```js
let videoList = Array.from(document.querySelectorAll('#contents ytd-playlist-video-renderer')).map(video => {
    let title = video.querySelector('#video-title').textContent.trim();
    let link = video.querySelector('#video-title').href;
    let id = link.split('v=')[1];
    return { title, link, id };
});
console.log(videoList);
console.log(JSON.stringify(videoList));
```

Paste the json array into a file called `WL.json` in the `data/` folder in the project directory. 

Create a file called `categoryList.txt` in the project directory with a list of categories separated by newlines. For example, the file could look like this:

```txt
🎮Gaming
🎵Music
🎨Art
📚Education
```

Run the following command to create and categorize playlists:

```sh
ts-node src/index.ts data/categoryList.txt data/WL.json
# OR
npm start src/index.ts data/categoryList.txt data/WL.json
```

### Rendering separate playlists jsons

You can then render a playlist by running the following command:

```sh
ts-node ts-node src/writeCatFile.ts "data/watchlistCategory.json"
```
