import { readFileSync, writeFileSync } from "fs";

import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from 'dotenv';
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from '@langchain/core/prompts';

dotenv.config();


export async function createCategories(categoryListPath: string, watchlistPath: string, isOllama: boolean) {

    const categories: string[] = readFileSync(categoryListPath, "utf-8")
        .split('\n')
        .filter(x => !x.includes('🎥Hold Projektek'))
        .filter(x => !x.includes('🏭Munka'))
        // .map(x => {if(x.includes('Történelem')) {return 'HISTORY'} else {return x}})
        .join('\n')
        .replaceAll('./01 - Projects/', '')
        .replaceAll('/🎥Hold Projektek', '')
        .replaceAll('/📽️🏰Org/', '')
        .replaceAll('/📽️🌲Life/', '')
        .replaceAll('/📽️🏭Munka/', '')
        .replaceAll('/🇮🇴🏰Org/', '')
        .replaceAll('/🇮🇴🌲Life/', '')
        .replaceAll('/🇮🇴🏭Munka/', '')
        .replaceAll('/📚🏰Org/', '')
        .replaceAll('/📚🌲Life/', '')
        .replaceAll('/📚🏭Munka/', '')
        .replaceAll('./02 - Areas/', '')
        .replaceAll('./03 - Resources/', '')
        .replaceAll('/', '')
        .split('\n')
        .filter(x => x.length > 0)
        .filter(x => !x.includes('🌲'))
        .filter(x => !x.includes('🏰'))
        .filter(x => !x.includes('🏭'))
        .filter(x => !x.includes('Apple Books'))
        .filter(x => !x.includes('Filmek'))
        .filter(x => !x.includes('attachments'))
        // .map(x => {if(x.includes('Filmek')) {return 'MEDIA'} else {return x}})
        ;

    if (categories.length === 0) {
        throw new Error('No categories found');
    }
    console.table(categories);

    writeFileSync("data/categoriesFiltered.txt", categories.join('\n'));


    const taggingPrompt = ChatPromptTemplate.fromTemplate(
        `Extract the desired information from the following text.
      
      Only extract the properties mentioned in the 'Classification' function.
      
      Passage:
      {input}
      `
    );
    // Add this check
    if (categories.length === 0) {
        throw new Error('No categories to create a schema');
    }

    const classificationSchema = z.object({
        category: z.enum([...categories] as [string, ...string[]]).describe("Best matching category of the youtube video. Try to pick the most relevant one if there are multiple contenders. Dont guess a random one!"),
        reson: z.string().describe("Describe why you picked this category. Use the text from the video to support your answer."),
    });

    // TODO: add a posibliity to use ollama for cheeper running costs OR use other model than gpt-4o
    let llm;
    if (!isOllama) {
        llm = new ChatOpenAI({
            // temperature: 0,
            modelName: "gpt-4o-mini",
        });
    } else {
        // TODO: make the model selectable in the .env
        llm = new ChatOllama({
            model: "phi4",
            temperature: 0,
        });
    }


    // Name is optional, but gives the models more clues as to what your schema represents
    const llmWihStructuredOutput = llm.withStructuredOutput(classificationSchema, {
        name: "extractor",
    });

    const taggingChain = taggingPrompt.pipe(llmWihStructuredOutput);



    const watchlist = JSON.parse(readFileSync(watchlistPath, "utf-8"));
    console.table(watchlist.map(x => x.title));

    const results = [];


    for (const video of watchlist) {
        try {
            const input = `${video.title} by ${video.channelName}`;
            console.log(input);
            const result: any = await taggingChain.invoke({ input });
            console.log(result);
            results.push({
                title: video.title,
                link: video.link,
                category: result.category,
                id: video.id,
                language: result.language,
                channelName: video.channelName,
                numberOfViews: video.numberOfViews,
            })
        } catch (error) {
            console.error("Error processing video:", video.title, error);
        }
    }

    writeFileSync("data/watchlistCategory.json", JSON.stringify(results, null, 2));
    return results;
}