import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REDIRECT_URI'
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

// Generate a URL for the user to authorize the application
function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube'],
    prompt: 'consent' // Forces consent screen to appear for refresh token
  });
}

// Start a local server to handle the OAuth callback
async function startLocalServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        // Parse the URL and query parameters
        const parsedUrl = url.parse(req.url || '', true);
        
        if (parsedUrl.pathname?.includes('/callback')) {
          const code = parsedUrl.query.code as string;
          
          if (!code) {
            throw new Error('No authorization code received');
          }
          
          // Exchange the authorization code for tokens
          const { tokens } = await oauth2Client.getToken(code);
          const refreshToken = tokens.refresh_token;
          
          if (!refreshToken) {
            throw new Error('No refresh token received. Make sure prompt:consent is included in the auth URL');
          }
          
          // Return a success page to the user
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authorization Successful</h1>
                <p>Your refresh token has been obtained successfully.</p>
                <p>You can close this window and return to the application.</p>
              </body>
            </html>
          `);
          
          // Update the .env file with the refresh token
          updateEnvFile(refreshToken);
          
          server.close();
          resolve(refreshToken);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
        }
      } catch (error: any) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Error</h1>
              <p>${error.message}</p>
            </body>
          </html>
        `);
        server.close();
        reject(error);
      }
    });
    
    // Extract port from redirect URI
    const redirectUri = process.env.REDIRECT_URI || '';
    const port = parseInt(redirectUri.split(':').pop()?.split('/')[0] || '3000');
    
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  });
}

// Update the .env file with the refresh token
function updateEnvFile(refreshToken: string): void {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add the REFRESH_TOKEN entry
    if (envContent.includes('REFRESH_TOKEN=')) {
      envContent = envContent.replace(/REFRESH_TOKEN=.*$/m, `REFRESH_TOKEN="${refreshToken}"`);
    } else {
      envContent += `\nREFRESH_TOKEN="${refreshToken}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env file with the refresh token');
  } catch (error) {
    console.error('Error updating .env file:', error);
    console.log('Please manually add the following to your .env file:');
    console.log(`REFRESH_TOKEN="${refreshToken}"`);
  }
}

// Main function to run the OAuth flow
export async function getYouTubeRefreshToken(): Promise<void> {
  try {
    console.log('Starting OAuth2 flow to obtain a refresh token...');
    
    // Generate the authorization URL
    const authUrl = getAuthUrl();
    console.log(`\nPlease visit the following URL to authorize the application:\n${authUrl}\n`);
    
    // Start the local server to handle the callback
    const refreshToken = await startLocalServer();
    console.log('\nAuthorization successful!');
    console.log(`Refresh token: ${refreshToken}`);
    console.log('\nThis refresh token has been saved to your .env file.');
    console.log('You can now use the YouTube API with your application.');
  } catch (error) {
    console.error('Error obtaining refresh token:', error);
  }
}

// Run the script directly if executed from the command line
if (require.main === module) {
  getYouTubeRefreshToken();
}
