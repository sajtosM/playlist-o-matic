import * as dotenv from "dotenv";
import { createCategories } from "./createCategories";
import { renderCategories } from "./renderCategories";

dotenv.config();

async function main() {
  const categoryListPath = process.argv[2];
  if (!categoryListPath) {
    console.error("Please provide a path to the category list file.");
    process.exit(1);
  }
  const watchlistPath = process.argv[3];
  if (!watchlistPath) {
    console.error("Please provide a path to the watchlist file.");
    process.exit(1);
  }

  // Check if the --ollama flag is passed
  const isOllama = process.argv.includes("--ollama");

  const categorizedList = await createCategories(categoryListPath, watchlistPath, isOllama);
  const fileName = watchlistPath.split("/").pop().replace(".json", ".md");
  renderCategories(categorizedList, fileName);

}

main();