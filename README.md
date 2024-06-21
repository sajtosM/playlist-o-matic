# Playlist-o-matic

Playlist-o-matic is a tool designed to automate the creation and categorization of YouTube playlists. It uses AI models to summarize YouTube videos and categorize them based on their content.

## Features

- Summarizes YouTube videos using AI models from Langchain, MistralAI, and OpenAI. (Coming soon)
- Categorizes videos and creates playlists based on their content.
- Provides a command-line interface for easy use.

## Installation

To install the project, you need to have Node.js installed on your machine. Then, you can clone the repository and install the dependencies:

```sh
git clone https://github.com/sajtosM/playlist-o-matic.git
cd playlist-o-matic
npm install
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

Paste the json array into a file called `WL.json` in the `data/` folder in the project directory. Then, run the following command to create and categorize playlists:

```sh
ts-node src/createCategories.ts
```

You can then render your playlists by running the following command:

```sh
ts-node src/renderCategories.ts > data/categoryList.md
```
