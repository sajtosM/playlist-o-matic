import axios from "axios";
import * as xml2js from "xml2js";
import { youtube_v3 } from "googleapis";
import { getYoutubeSummary } from './youtubeSumm.js';

export async function processPlaylist(playlistId: string): Promise<void> {
  const playlistItems = await getPlaylistItems(playlistId);
  for (const item of playlistItems) {
    const videoId = item["yt:videoId"][0];
    if (videoId) {
      const transcript = await getYoutubeSummary(videoId, "mistral");
      await storeInDatabase(item, transcript);
    }
  }
}// const youtube = google.youtube({
//   version: "v3",
//   auth: process.env.YOUTUBE_API_KEY, // Make sure to set this environment variable
// });

export async function getPlaylistItems(playlistId: string): Promise<any> {
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


export async function storeInDatabase(
  videoData: youtube_v3.Schema$PlaylistItemSnippet,
  transcript: string
): Promise<void> {
  // This is a placeholder function. You would need to implement the logic to store the data in your database.
  console.log(
    `Storing video ${videoData.resourceId?.videoId} with transcript in database. Transcript: ${transcript}`
  );
}

