import { addVideoToPlaylist, createPlaylist, getPlaylists } from "./playListManagement";
import { createCategoryList } from "./renderCategories";

/**
 * Creates playlists for each category in the watchlist and adds videos to the playlists.
 */
export const createPlaylistsForCategories = async (watchlist: any, categoryId: string) => {

    const categoryList = createCategoryList(watchlist);
    console.log('Creating playlists for categories');
    const existingPlaylists = await getPlaylists();
    for (const category in categoryList) {
        if (categoryId && category !== categoryId) {
            console.log(`Skipping category "${category}" as it does not match the provided category ID "${categoryId}"`);
            continue;
        }

        // check if playlist already exists
        const prefix = process.env.YOUTUBE_PLAYLIST_PREFIX || '';
        if (existingPlaylists.some((playlist: any) => playlist.snippet.title === prefix + category)) {
            console.log(`Playlist "${category}" already exists, skipping...`);
            continue;

        }

        const playlistId = await createPlaylist(category, `Playlist for ${category}`, "private");
        console.log(`Created playlist "${category}" with ID: ${playlistId}`);
        for (const video of categoryList[category]) {
            let videoId = video.id;
            if (videoId.includes('&')) {
                videoId = videoId.split('&')[0];
            }
            try {
                await addVideoToPlaylist(playlistId, videoId);
            } catch (error) {
                console.error(`Error adding video ${videoId} to playlist ${playlistId}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // wait for 0.2 second
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds
    }
};