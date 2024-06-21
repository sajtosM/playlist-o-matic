import { read, readFileSync } from "fs";

async function main(file:string) {

    const results = JSON.parse(readFileSync(file, "utf-8"));
    const categoryList = {};
    for (const result of results) {
        const category = result.category;
        if (!categoryList[category]) {
            categoryList[category] = [];
        }
        categoryList[category].push(result);
    }

    // write out as markdown
    for (let i = 0; i < Object.keys(categoryList).length; i++) {
        const element = categoryList[Object.keys(categoryList)[i]];
        console.log(`## ${Object.keys(categoryList)[i]}`);

        console.log("| Title | Url |");
        console.log("| --- | --- |");
        for (const video of element) {
            console.log(`| [${video.title.replaceAll('|','')}](${video.link}) | ${video.link} |`);
        }
    }
}

const file = process.argv[2] || "data/watchlistCategory.json";

main(file);