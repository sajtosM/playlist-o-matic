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

    // Example videos for few-shot learning
    const exampleVideos = [
        {
            input: "How to Build a Gaming PC in 2025 by TechReviews",
            output: {
                category: "Technology",
                reason: "This video is about building computer hardware, which falls under Technology."
            }
        },
        {
            input: "French Cooking Techniques Every Chef Should Know by FoodMasters",
            output: {
                category: "Cooking",
                reason: "This is a cooking tutorial about French techniques."
            }
        }
    ];

    const taggingPrompt = ChatPromptTemplate.fromTemplate(
        `You are a video categorization assistant. Your task is to assign a single category to a YouTube video.

        VIDEO INFORMATION:
        Title: {input}

        AVAILABLE CATEGORIES:
        ${categories.join(', ')}

        EXAMPLES:
        ${exampleVideos.map(ex => `Input: "${ex.input}"\nOutput:\ncategory: ${ex.output.category}\nreason: ${ex.output.reason}`).join('\n\n')}

        INSTRUCTIONS:
        1. Read the video title carefully
        2. Choose exactly ONE category from the list above
        3. Provide a brief explanation for your choice

        Your response should follow this exact format:
        category: [selected category]
        reason: [your brief explanation]

        Do not add any other text to your response.`
    );

    // Add this check
    if (categories.length === 0) {
        throw new Error('No categories to create a schema');
    }

    const classificationSchema = z.object({
        category: z.enum([...categories] as [string, ...string[]]).describe("Pick the single most appropriate category from the list that best matches the YouTube video content."),
        reason: z.string().describe("Provide a brief explanation (1-2 sentences) for your category selection.")
    });

    let llm;
    if (!isOllama) {
        llm = new ChatOpenAI({
            modelName: "gpt-4o-mini",
        });
    } else {
        // get the model from the env
        const model = process.env.OLLAMA_MODEL || "phi4";
        llm = new ChatOllama({
            model: model,
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