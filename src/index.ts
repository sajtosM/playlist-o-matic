import * as dotenv from "dotenv";
import { createCategories } from "./service/createCategories";
import { renderCategories } from "./service/renderCategories";
import { createPlaylistsForCategories } from "./service/createPlaylists";
import { readFileSync } from "fs";
import { getWatchLaterPlaylistId, getWatchLaterVideos } from "./service/playListManagement";

dotenv.config();

async function main() {
  let categoryListPath, watchlistPath, categorizedList
  const isRender = process.argv.includes("--render");
  if (!isRender) {
    categoryListPath = process.argv[2];
    if (!categoryListPath) {
      console.error("Please provide a path to the category list file.");
      process.exit(1);
    }
    watchlistPath = process.argv[3];
    if (!watchlistPath) {
      console.error("Please provide a path to the watchlist file.");
      process.exit(1);
    }
    // categorise the watchlist
    // Check if the --ollama flag is passed
    const isOllama = process.argv.includes("--ollama");
    console.log(isOllama ? "Using Ollama" : "Using OpenAI");
    categorizedList = await createCategories(categoryListPath, watchlistPath, isOllama);
  } else {
    // If --render is passed, read the categorized list from a file
    const categorizedListPath = process.argv[2];
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

  let categoryId;
  if (process.argv[3] && !process.argv[3].startsWith("--")) {
  
    categoryId = process.argv[3];  
  }

  const isYoutubePlaylist = process.argv.includes("--youtubePlaylist");
  if (isYoutubePlaylist) {
    // if --youtubePlaylist is passed, create the youtube playlists
    await createPlaylistsForCategories(categorizedList, categoryId);
  }

}

main();