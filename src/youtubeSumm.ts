import { PromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";
import { loadSummarizationChain } from "langchain/chains";
import { YoutubeLoader } from "langchain/document_loaders/web/youtube";
import { TokenTextSplitter } from "langchain/text_splitter";
import readline from "readline";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

export const getYoutubeInfo = async function (youtubeUrl: string) {
  // FIXME: youtube loader is deprecated, find a new way to load youtube info
  try {
    const loader = YoutubeLoader.createFromUrl(youtubeUrl, {
      language: "en",
      addVideoInfo: true,
    });
    const docs = await loader.load();
    console.log(`Summarizing: [${docs[0].metadata.title}](${youtubeUrl})\n`);
    return docs;
  } catch (e) {
    console.error(e);
    debugger;
    return undefined;
  }
};

export const getYoutubeSummary = async function (
  youtubeUrl: string,
  model: string,
  verboseFlag?: boolean
): Promise<string> {
  dotenv.config();

  //   const loader = new SearchApiLoader({
  //     engine: "youtube_transcripts",
  //     video_id: "hhT4M0UjJcg",
  //   });

  //   const docs = await loader.load();

  const docs = await getYoutubeInfo(youtubeUrl);
  if (!docs) {
    return "Youtube video could not be loaded.";
  }

  const splitter = new TokenTextSplitter({
    chunkSize: 10000,
    chunkOverlap: 250,
  });

  const docsSummary = await splitter.splitDocuments(docs);

  let llmSummary;
  if (model.includes("gpt-4")) {
    llmSummary = new ChatOpenAI({
      temperature: 0.3,
      modelName: model,
    });
  } else if (model === "mistral-small") {
    llmSummary = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: "mistral-small",
    });
  } else {
    // TODO: use an instruct mode and output JSON
    llmSummary = new ChatOllama({
      model: model,
      temperature: 0.1,
    });
  }

  const summaryTemplate = `
You are an expert in summarizing YouTube videos.
Always find the best and most simple and obvious soulution to a problem.
Always break down the problem, objects, numbers and logic before starting to solve the problem in a step-by-step way.
Your goal is to create a summary of a video.
Below you find the transcript of a video:
--------
{text}
--------

The transcript of the video will also be used as the basis for a question and answer bot.

Total output will be a summary of the video and a list of insights.

SUMMARY AND INSIGHTS:
`;

  const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

  const summaryRefineTemplate = `
You are an expert in summarizing YouTube videos.
Always find the best and most simple and obvious soulution to a problem.
Always break down the problem, objects, numbers and logic before starting to solve the problem in a step-by-step way.
Your goal is to create a summary of a video.
We have provided an existing summary up to a certain point: {existing_answer}

Below you find the transcript of a video:
--------
{text}
--------

Given the new context, refine the summary and insights.
Provide insights about the topic of the video as bulletpoints. Make these insights very specific.
If the context isn't useful, return the original summary and insights.
Total output will be a summary of the video and a list of insights.

SUMMARY AND INSIGHTS:
`;

  const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
    summaryRefineTemplate
  );

  const summarizeChain = loadSummarizationChain(llmSummary, {
    type: "refine",
    verbose: verboseFlag,
    questionPrompt: SUMMARY_PROMPT,
    refinePrompt: SUMMARY_REFINE_PROMPT,
  });

  const summary = await summarizeChain.run(docsSummary);

  console.log(summary);
  return summary;
};
const args = process.argv.slice(2); // slice the first two elements which are 'node' and the script name
if (args) {
  let url = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-u" && i + 1 < args.length) {
      url = args[i + 1];
      break;
    }
  }
  let model = "mistral";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-m" && i + 1 < args.length) {
      model = args[i + 1];
      break;
    }
  }
  console.log(`Using model: ${model}`);

  const verboseFlag = args.includes("-V");

  if (url) {
    getYoutubeSummary(url, model, verboseFlag);
  } else {
    console.log("No URL provided with -u flag");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Please enter a URL: \n", (inputUrl) => {
      url = inputUrl;
      getYoutubeSummary(url, model, verboseFlag);
      rl.close();
    });
  }
}
