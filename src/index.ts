#!/usr/bin/env node
import * as dotenv from "dotenv";
import meow from "meow";
import { createCategories } from "./service/createCategories.js";
import { renderCategories } from "./service/renderCategories.js";
import { createPlaylistsForCategories } from "./service/createPlaylists.js";
import { readFileSync } from "fs";
import { getWatchLaterPlaylistId, getWatchLaterVideos } from "./service/playListManagement.js";

dotenv.config();

const cli = meow(`
	Usage
	  $ playlist-o-matic [options] <categoryListPath> <watchlistPath>

	Options
	  --render, -r             Render categories from a previously categorized list
	  --ollama, -o             Use Ollama instead of OpenAI
	  --youtubePlaylist, -y    Create YouTube playlists for categories
	  --category, -c           Specify a category ID for YouTube playlist creation
	  --help                   Show this help text

	Examples
	  $ playlist-o-matic ./data/categories.txt ./data/WL.json
	  $ playlist-o-matic --render ./data/watchlistCategory.json
	  $ playlist-o-matic ./data/categories.txt ./data/WL.json --ollama
	  $ playlist-o-matic --render ./data/watchlistCategory.json --youtubePlaylist --category music
`, {
	importMeta: import.meta,
	flags: {
		render: {
			type: 'boolean',
			shortFlag: 'r'
		},
		ollama: {
			type: 'boolean',
			shortFlag: 'o'
		},
		youtubePlaylist: {
			type: 'boolean',
			shortFlag: 'y'
		},
		category: {
			type: 'string',
			shortFlag: 'c'
		}
	}
});

async function main() {
  let categoryListPath, watchlistPath, categorizedList;
  
  if (!cli.flags.render) {
    categoryListPath = cli.input[0];
    if (!categoryListPath) {
      console.error("Please provide a path to the category list file.");
      process.exit(1);
    }
    watchlistPath = cli.input[1];
    if (!watchlistPath) {
      console.error("Please provide a path to the watchlist file.");
      process.exit(1);
    }
    
    // categorise the watchlist
    console.log(cli.flags.ollama ? "Using Ollama" : "Using OpenAI");
    categorizedList = await createCategories(categoryListPath, watchlistPath, cli.flags.ollama);
  } else {
    // If --render is passed, read the categorized list from a file
    const categorizedListPath = cli.input[0];
    if (!categorizedListPath) {
      console.error("Please provide a path to the categorized list file.");
      process.exit(1);
    }
    categorizedList = JSON.parse(readFileSync(categorizedListPath, "utf-8"));
    watchlistPath = categorizedListPath;
  }

  // create the markdown file
  const fileName = watchlistPath.split("/").pop().replace(".json", ".md");
  renderCategories(categorizedList, fileName);

  if (cli.flags.youtubePlaylist) {
    // if --youtubePlaylist is passed, create the youtube playlists
    await createPlaylistsForCategories(categorizedList, cli.flags.category);
  }
}

main();