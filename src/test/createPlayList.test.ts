import { createPlaylist } from "../service/playListManagement";

// Set longer timeout for integration tests
jest.setTimeout(5 * 60000);

describe("createPlaylist", () => {
	it("should create a playlist", async () => {
		const playlistId = await createPlaylist("Test Playlist", "This is a test playlist", "private");
		console.log("Created playlist with ID:", playlistId);
	});
});