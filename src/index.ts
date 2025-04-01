import * as dotenv from "dotenv";
import { createCategories } from "./service/createCategories";
import { renderCategories } from "./service/renderCategories";
import { createPlaylistsForCategories } from "./service/createPlaylists";
import { readFileSync } from "fs";

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

    // Check if the --ollama flag is passed
    const isOllama = process.argv.includes("--ollama");
    console.log(isOllama ? "Using Ollama" : "Using gpt-4");
    categorizedList = await createCategories(categoryListPath, watchlistPath, isOllama);
  } else {
    const categorizedListPath = process.argv[2];
    if (!categorizedListPath) {
      console.error("Please provide a path to the categorized list file.");
      process.exit(1);
    }
    categorizedList = JSON.parse(readFileSync(categorizedListPath, "utf-8"));
    watchlistPath = categorizedListPath;
  }

  const fileName = watchlistPath.split("/").pop().replace(".json", ".md");
  renderCategories(categorizedList, fileName);

  const isYoutubePlaylist = process.argv.includes("--youtubePlaylist");
  if (isYoutubePlaylist) {
    await createPlaylistsForCategories(categorizedList);
  }

}

main();