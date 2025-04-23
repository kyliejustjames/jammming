const clientId = 'f0d6cc9de7ff4321b04469e0a48d0a69';
const redirectUri = 'http://127.0.0.1:3000/';
const apiUrl = 'https://api.spotify.com/v1';

// We are authorizing users with the PCKE workflow since implicit grant is deprecated.
// Many of the functions here are adataped from these docs:
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

// Data structure that manages the current active token, caching it in localStorage
const currentToken = {
  get access_token() { return localStorage.getItem('spotify_access_token') || null; },
  get refresh_token() { return localStorage.getItem('spotify_refresh_token') || null; },
  get expires_in() { return localStorage.getItem('spotify_expires_in') || null },
  get expires() { return localStorage.getItem('spotify_expires') || null },

  save: function (response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_refresh_token', refresh_token);
    localStorage.setItem('spotify_expires_in', expires_in);

    const now = new Date();
    const expiry = new Date(now.getTime() + (expires_in * 1000));
    localStorage.setItem('spotify_expires', expiry);
  }
};

/** Generate a random string */
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

/** Hash a string using SHA-256 */
const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

/** Base64 encode our digest */
const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const spotify = {
  /**
   * Determine whether the user is authenticated with the Spotify API.
   */
  isAuthenticated() {
    return localStorage.getItem('spotify_access_token') ? true : false;
  },
  /**
   * Redirect the user to spotify's authorize route to get a code. If the user gives our 
   * app access, Spotify will redirect them here with a code in the querystring. You can 
   * then use the code to call `getAccessToken(code)`.
   */
  async redirectToSpotifyForAuthCode() {
    // Create and store our code verifier.
    const codeVerifier = generateRandomString(64);
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    // Create our code challenge
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Redirect them to spotify's authorization endpoint (which will eventually redirect them back to our app),.
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: 'playlist-modify-public user-read-private playlist-modify-private',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  },
  /**
   * Get an access token from a code. Assumes you called redirectToSpotifyForAuthCode to get a code.
   */
  async getAccessToken(code) {
    // Stored in the previous step
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    const url = "https://accounts.spotify.com/api/token";
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
    // Make the HTTP POST request
    const body = await fetch(url, payload);
    // Turn body into JSON
    const response = await body.json();
    console.log(response);
    // Set our access token in local storage.
    localStorage.setItem('spotify_access_token', response.access_token);
    currentToken.save(response);
  },
  search(term) {
    const accessToken = currentToken.access_token;
    return fetch(`${apiUrl}/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      },
        (error) => {
          console.error("Error fetching search results:", error); // Added error handling
          return []; // Return an empty array in case of error to prevent the app from crashing.
        }
      );
  },
  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }
    const accessToken = currentToken.access_token;
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch(`${apiUrl}/me`, { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userId = jsonResponse.id;
        return fetch(`${apiUrl}/users/${userId}/playlists`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistId = jsonResponse.id;
            return fetch(`${apiUrl}/users/${userId}/playlists/${playlistId}/tracks`, {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({ uris: trackUris }),
            });
          });
      });
  },
};

export default spotify;