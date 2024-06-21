import axios from "axios";
import * as dotenv from "dotenv";
import { youtube_v3 } from "googleapis";
import * as process from "process";

import * as xml2js from 'xml2js';
import { getYoutubeSummary } from './youtubeSumm';

dotenv.config();

// const youtube = google.youtube({
//   version: "v3",
//   auth: process.env.YOUTUBE_API_KEY, // Make sure to set this environment variable
// });

async function getPlaylistItems(playlistId: string): Promise<any> {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
    headers: {},
  };

  try {
    const response = await axios.request(config);
    const parser = new xml2js.Parser();
    const result: any = await new Promise((resolve, reject) => {
      parser.parseString(response.data, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    console.log(result);
    return result.feed.entry;
    debugger;
  } catch (error) {
    debugger;
    return null;
  }
}

async function getVideoTranscript(videoId: string): Promise<string> {
  const summary = await getYoutubeSummary(`https://www.youtube.com/watch?v=${videoId}`);
  debugger;
  // This is a placeholder function as YouTube API does not provide a way to get video transcripts.
  // You would need to use a different service or package to get the transcript.

  //   const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  //   return transcript;
  return summary;
}

async function storeInDatabase(
  videoData: youtube_v3.Schema$PlaylistItemSnippet,
  transcript: string
): Promise<void> {
  // This is a placeholder function. You would need to implement the logic to store the data in your database.
  console.log(
    `Storing video ${videoData.resourceId?.videoId} with transcript in database. Transcript: ${transcript}`
  );
}

async function processPlaylist(playlistId: string): Promise<void> {
  const playlistItems = await getPlaylistItems(playlistId);
  for (const item of playlistItems) {
    const videoId = item["yt:videoId"][0];
    if (videoId) {
      const transcript = await getVideoTranscript(videoId);
      await storeInDatabase(item, transcript);
    }
  }
}

// Start the process with a given playlist ID
processPlaylist(process.env.PLAYLIST_ID || "");
