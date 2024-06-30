import { readFileSync } from "fs";
import { renderCategories } from "./renderCategories";

const categoryFilePath = process.argv[2];

const data = JSON.parse(readFileSync(categoryFilePath, "utf-8"));
const fileName = categoryFilePath.split("/").pop().replace(".json", ".md");
renderCategories(data, fileName);