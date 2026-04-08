import { readFileSync, writeFileSync } from "fs";
import natural from 'natural';
import winkPosTagger from "wink-pos-tagger";
import { addVideoToPlaylist, createPlaylist } from "./service/playListManagement";
import { resolve } from "path";

type Video = {
    title: string;
    channelName: string;
    category?: string;
    numberOfViews?: string;
    whenWasItPosted: string;
};

function stringSimilarity(a: string, b: string): number {
    // Use Levenshtein distance for better string similarity
    const normalizedA = a.toLowerCase();
    const normalizedB = b.toLowerCase();

    // Calculate Jaro-Winkler distance (returns value between 0 and 1)
    const distance = natural.JaroWinklerDistance(normalizedA, normalizedB);

    // Can also consider TF-IDF with:
    // const tfidf = new natural.TfIdf();
    // tfidf.addDocument(normalizedA);
    // tfidf.addDocument(normalizedB);

    return distance;
}

function keywordSimilarity(a: string, b: string): number {
    const tokenize = (text: string): Set<string> =>
        new Set(text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/));

    const aWords = tokenize(a);
    const bWords = tokenize(b);

    const intersection = new Set([...aWords].filter(word => bWords.has(word)));
    const union = new Set([...aWords, ...bWords]);

    // Jaccard similarity: size of intersection / size of union
    return union.size === 0 ? 0 : intersection.size / union.size;
}


const tagger = winkPosTagger();

function extractNounsVerbs(text: string): Set<string> {
    const tagged = tagger.tagSentence(text);
    return new Set(
        tagged
            .filter(w => w.pos.startsWith('NN') || w.pos.startsWith('VB'))
            .map(w => w.lemma || w.normal)
    );
}

function nounVerbSimilarity(a: string, b: string): number {
    const A = extractNounsVerbs(a);
    const B = extractNounsVerbs(b);
    const inter = new Set([...A].filter(w => B.has(w)));
    const union = new Set([...A, ...B]);
    return union.size === 0 ? 0 : inter.size / union.size;
}


// Make sure to install with: npm install natural
// And add types with: npm install --save-dev @types/natural

function rateWatchlistByLikes(watchlistPath: string, likedPath: string, outputPath: string) {
    const watchlist: Video[] = JSON.parse(readFileSync(watchlistPath, "utf-8"));
    const liked: Video[] = JSON.parse(readFileSync(likedPath, "utf-8"));

    // Build a set of liked channels for quick lookup
    const likedChannels = new Set(liked.map(v => v.channelName));

    // Score each watchlist video
    const scored = watchlist.map(video => {
        console.log(`Scoring video: ${video.title} by channel: ${video.channelName}`);
        let score = 0;
        // Score by channel match
        const likedInChannel = liked.filter(likedVid => likedVid.channelName === video.channelName);
        if (likedInChannel.length > 9) {
            score++;
        }
        if (likedInChannel.length > 4) {
            score++;
        }

        if (likedInChannel.length > 0) {
            // if (likedInChannel.(likedVid => likedVid.whenWasItPosted.includes('évvel'))) {
            //  if all liked videos in channel are older than 1 year
            if (likedInChannel.every(likedVid => !likedVid.whenWasItPosted || likedVid.whenWasItPosted.includes('évvel'))) {
                score-=3;
            }
        }
        // if (likedInChannel.length > 0) {
        //     score++;
        // }
        console.log(`Channel score for ${video.channelName}: ${score} (based on ${likedInChannel.length} liked videos)`);

        // Score by title similarity to any liked video
        const maxTitleSim = Math.max(
            ...(liked.map(likedVid => keywordSimilarity(video.title, likedVid.title) + nounVerbSimilarity(video.title, likedVid.title))),
            0
        );
        const mostSimilarLiked = liked.reduce((best, current) => {
            const sim = keywordSimilarity(video.title, current.title) + nounVerbSimilarity(video.title, current.title);
            return sim > best.similarity ? { video: current, similarity: sim } : best;
        }, { video: null, similarity: 0 });
        score += maxTitleSim;
        console.log(`Max title similarity for ${video.title}: ${maxTitleSim}, most similar to ${mostSimilarLiked.video ? mostSimilarLiked.video.title : 'none'} by ${mostSimilarLiked.video ? mostSimilarLiked.video.channelName : 'unknown'}`);

        // Optionally, score by category
        if (video.category) {
            const likedCategories = new Set(liked.map(v => v.category));
            if (likedCategories.has(video.category)) score += 0.5;
        }

        console.log(`Final score for ${video.title} by ${video.channelName}: ${score}`);

        return { ...video, score, likedSize: likedInChannel.length, titleSimilarity: maxTitleSim, mostSimilarLiked: mostSimilarLiked.video ? mostSimilarLiked.video.title : null };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Save to output
    writeFileSync(outputPath, JSON.stringify(scored, null, 2));
    console.log(`Ranked watchlist saved to ${outputPath}`);

    createTop30Playlist(scored);
    console.log("Top 30 playlist creation initiated.");
}

/**
 * Creates a YouTube playlist with the top 30 videos from WL_ranked.json
 */
export const createTop30Playlist = async (wlRanked) => {

    // Filter out entries without a valid id
    const videos = wlRanked.filter((v: any) => v.id && typeof v.score === "number");

    // Sort by score descending and take top 30
    const top30 = videos.sort((a: any, b: any) => b.score - a.score).slice(0, 30);

    // Create playlist
    const playlistTitle = "#AI-Top 30 Ranked Watchlist";
    const playlistDescription = "Automatically generated playlist of top 30 ranked videos from WL_ranked.json";
    const playlistId = await createPlaylist(playlistTitle, playlistDescription, "private");

    console.log(`Created playlist "${playlistTitle}" with ID: ${playlistId}`);

    // Add videos to playlist
    for (const video of top30) {
        let videoId = video.id.split("&")[0]; // Remove extra params if present
        try {
            await addVideoToPlaylist(playlistId, videoId);
            console.log(`Added video ${video.title} ${videoId} to playlist`);
        } catch (error) {
            console.error(`Error adding video ${videoId}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 200)); // avoid quota issues
    }
    console.log("Finished adding top 30 videos.");
};
// ...existing code...

// Example usage:
rateWatchlistByLikes("data/WL.json", "data/liked_merged.json", "data/WL_ranked.json");