import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { getYouTubeRefreshToken } from './getRefreshToken';

dotenv.config();

/**
 * Checks if a refresh token is available and provides guidance if not
 */
if (!process.env.REFRESH_TOKEN) {
  console.error('Error: REFRESH_TOKEN is missing in your .env file');
  console.log('To obtain a refresh token, run:');
  console.log('node -e "require(\'./dist/service/getRefreshToken\').getYouTubeRefreshToken()"');
  getYouTubeRefreshToken();
  throw new Error('Missing REFRESH_TOKEN');
}

// REDIRECT_URI: The URL where Google redirects users after they authorize your application.
// Example for development: http://localhost:PORT/callback
// Example for production: https://yourdomain.com/callback
// Ensure this matches the authorized redirect URIs in your Google Cloud Console project.

// REFRESH_TOKEN: A long-lived token to obtain new access tokens without user interaction.
// To generate:
// 1. Use oauth2Client.generateAuthUrl() with 'access_type: offline' and 'prompt: consent'.
// 2. Exchange the authorization code for tokens using oauth2Client.getToken().
// 3. Save the refresh_token securely in your .env file.

// Check for required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDIRECT_URI',
  'REFRESH_TOKEN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}



// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Only set credentials if refresh token is available
if (process.env.REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
}

// Initialize YouTube API client
const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client,
});

/**
 * Create a new YouTube playlist
 * @param title The title of the playlist
 * @param description A description of the playlist
 * @param privacyStatus The privacy status of the playlist ('public', 'private', or 'unlisted')
 * @returns The ID of the created playlist
 */
export async function createPlaylist(
  title: string,
  description: string,
  privacyStatus: 'public' | 'private' | 'unlisted' = 'private'
): Promise<string> {
  try {
    const prefix = process.env.YOUTUBE_PLAYLIST_PREFIX || '';
    console.log(`Creating playlist with title: ${prefix}${title}`);
    const response = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: prefix + title,
          description: description,
        },
        status: {
          privacyStatus: privacyStatus,
        },
      },
    });

    if (!response.data.id) {
      throw new Error('Playlist created but no ID was returned');
    }

    console.log(`Created playlist "${prefix}${title} with ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}

/**
 * Add a video to a YouTube playlist
 * @param playlistId The ID of the playlist
 * @param videoId The ID of the video to add
 * @returns The playlist item ID
 */
export async function addVideoToPlaylist(
  playlistId: string,
  videoId: string
): Promise<string> {
  try {
    const response = await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId,
          },
        },
      },
    });

    if (!response.data.id) {
      throw new Error('Video added but no playlist item ID was returned');
    }

    console.log(`Added video ${videoId} to playlist ${playlistId}`);
    return response.data.id;
  } catch (error) {
    console.error(`Error adding video ${videoId} to playlist:`, error);
    throw error;
  }
}

/**
 * Remove a video from a playlist
 * @param playlistItemId The ID of the playlist item to remove
 */
export async function removeVideoFromPlaylist(playlistItemId: string): Promise<void> {
  try {
    await youtube.playlistItems.delete({
      id: playlistItemId,
    });
    console.log(`Removed video with playlist item ID: ${playlistItemId}`);
  } catch (error) {
    console.error(`Error removing video with playlist item ID ${playlistItemId}:`, error);
    throw error;
  }
}

/**
 * Get all playlists for the authenticated user
 * @param maxResults Maximum number of results to return
 * @returns Array of playlists
 */
export async function getPlaylists(maxResults: number = 25) {
  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: maxResults,
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error retrieving playlists:', error);
    throw error;
  }
}

/**
 * Get the "Watch Later" playlist ID for the authenticated user
 * @returns The Watch Later playlist ID or null if not found
 */
export async function getWatchLaterPlaylistId(): Promise<string | null> {
  // 💭Yeah this does not seem to be possible. Google does not want us to access this.
  try {
    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      mine: true,
      maxResults: 50,
    });

    const watchLaterPlaylist = response.data.items?.find(
      playlist => playlist.snippet?.title === 'Watch later'
    );
    
    return watchLaterPlaylist?.id || null;
  } catch (error) {
    console.error('Error retrieving Watch Later playlist:', error);
    throw error;
  }
}

/**
 * Get all videos from the Watch Later playlist
 * 🛑 Not working
 * @returns Array of videos in the Watch Later playlist
 */
export async function getWatchLaterVideos(): Promise<any[]> {
  try {
    // const watchLaterPlaylistId = await getWatchLaterPlaylistId();
    const watchLaterPlaylistId = 'WL';
    
    if (!watchLaterPlaylistId) {
      throw new Error('Watch Later playlist not found');
    }
    
    const videos: any[] = [];
    let pageToken: string | undefined;
    
    do {
      const response = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: watchLaterPlaylistId,
        maxResults: 50,
        pageToken: pageToken,
      });
      
      if (response.data.items) {
        const formattedVideos = response.data.items.map(item => ({
          title: item.snippet?.title || '',
          link: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
          id: item.contentDetails?.videoId || '',
          channelName: item.snippet?.channelTitle || '',
          // Note: view count and publish date require additional API calls
          numberOfView: '',
          whenWasItPosted: '',
        }));
        
        videos.push(...formattedVideos);
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
    return videos;
  } catch (error) {
    console.error('Error retrieving Watch Later videos:', error);
    throw error;
  }
}

// ...existing code...