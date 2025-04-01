import { writeFileSync } from "fs";

export async function renderCategories(watchlist: any, fileName?: string) {

    const categoryList = createCategoryList(watchlist);
    console.log('Creating markdown file');
    let fileContent = `File generated at ${new Date().toISOString()}\n\n`;

    // write out as markdown
    for (let i = 0; i < Object.keys(categoryList).length; i++) {
        const element = categoryList[Object.keys(categoryList)[i]];
        fileContent += `## ${Object.keys(categoryList)[i]}\n`

        fileContent += "| Title | Url |\n";
        fileContent += "| --- | --- |\n";
        for (const video of element) {
            fileContent += `| [${video.title.replaceAll('|', '')}](${video.link}) | ${video.link} |\n`;
        }
    }
    if (fileName) {
        fileName = "watchlistCategory.md";
    }
    console.log('Writing file:' + 'data/' + fileName);
    writeFileSync('data/' + fileName, fileContent, "utf-8");
    console.log('File written');
}

export const createCategoryList = (watchlist: any) => {
    let results = watchlist;
    const categoryList = {};
    for (const result of results) {
        const category = result.category;
        if (!categoryList[category]) {
            categoryList[category] = [];
        }
        categoryList[category].push(result);
    }
    return categoryList;
}
